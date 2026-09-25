import Razorpay from "razorpay";
import prisma from "../../lib/prisma.js";
import {
  enforceCors,
  getClientIp,
  hashIp,
  validateDonationOrder,
  verifyTurnstile,
} from "../_lib/security.js";

const MAX_ATTEMPTS_PER_HOUR = 8;

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function orderResponse(attempt) {
  return {
    id: attempt.orderId,
    amount: attempt.amountInPaise,
    currency: attempt.currency,
  };
}

function matchesOrderDetails(attempt, input) {
  return (
    attempt.amountInPaise === input.amountInPaise &&
    attempt.name === input.name &&
    attempt.email === input.email &&
    attempt.contact === input.contact &&
    attempt.address === input.address &&
    attempt.reason === input.reason
  );
}

export default async function handler(req, res) {
  if (!enforceCors(req, res, ["POST", "OPTIONS"])) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const validation = validateDonationOrder(req.body);
  if (validation.error) return res.status(400).json({ error: validation.error });

  const input = validation.data;
  const clientIp = getClientIp(req);
  let ipHash;
  try {
    ipHash = hashIp(clientIp);
  } catch (error) {
    console.error("Rate-limit configuration error:", error.message);
    return res.status(503).json({ error: "Payments are temporarily unavailable" });
  }

  try {
    const existing = await prisma.paymentAttempt.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    let attempt;

    if (existing) {
      if (existing.ipHash !== ipHash) {
        return res.status(409).json({ error: "Payment attempt cannot be reused" });
      }
      if (!matchesOrderDetails(existing, input)) {
        return res.status(409).json({ error: "Donation details changed. Please start a new payment attempt." });
      }
      if (existing.orderId) return res.status(200).json(orderResponse(existing));

      if (existing.status !== "ORDER_FAILED") {
        return res.status(409).json({ error: "A payment attempt is already being processed" });
      }

      // Claim the retry atomically so simultaneous client retries cannot make
      // two Razorpay orders for the same idempotency key.
      const retryClaim = await prisma.paymentAttempt.updateMany({
        where: { id: existing.id, status: "ORDER_FAILED", orderId: null },
        data: { status: "RETRYING" },
      });
      if (retryClaim.count !== 1) {
        return res.status(409).json({ error: "A payment retry is already being processed" });
      }
      attempt = await prisma.paymentAttempt.findUnique({ where: { id: existing.id } });
    } else {
      const isHuman = await verifyTurnstile(input.turnstileToken, clientIp);
      if (!isHuman) return res.status(403).json({ error: "Security verification failed. Please try again." });

      attempt = await prisma.$transaction(
        async (tx) => {
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const recentAttempts = await tx.paymentAttempt.count({
            where: { ipHash, createdAt: { gte: hourAgo } },
          });

          if (recentAttempts >= MAX_ATTEMPTS_PER_HOUR) {
            const rateLimitError = new Error("RATE_LIMITED");
            rateLimitError.code = "RATE_LIMITED";
            throw rateLimitError;
          }

          return tx.paymentAttempt.create({
            data: {
              idempotencyKey: input.idempotencyKey,
              ipHash,
              receipt: `relf_${input.idempotencyKey}`,
              amountInPaise: input.amountInPaise,
              name: input.name,
              email: input.email,
              contact: input.contact,
              address: input.address,
              reason: input.reason,
            },
          });
        },
        { isolationLevel: "Serializable" },
      );
    }

    if (!attempt) throw new Error("Payment attempt could not be prepared");

    let order;
    try {
      order = await instance.orders.create({
        amount: attempt.amountInPaise,
        currency: attempt.currency,
        receipt: attempt.receipt,
        notes: {
          attemptId: attempt.id,
          name: attempt.name,
          email: attempt.email,
          contact: attempt.contact,
          address: attempt.address,
          reason: attempt.reason,
        },
      });
    } catch (error) {
      await prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: { status: "ORDER_FAILED" },
      });
      throw error;
    }

    const savedAttempt = await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: { orderId: order.id, status: "ORDER_CREATED" },
    });

    return res.status(200).json(orderResponse(savedAttempt));
  } catch (error) {
    if (error.code === "RATE_LIMITED") {
      res.setHeader("Retry-After", "3600");
      return res.status(429).json({ error: "Too many donation attempts. Please try again in an hour." });
    }
    if (error.code === "P2034") {
      return res.status(429).json({ error: "Please wait a moment and try again." });
    }
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({ error: "Order creation failed" });
  }
}
