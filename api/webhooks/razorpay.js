import { Prisma } from "@prisma/client";
import crypto from "crypto";
import prisma from "../../lib/prisma.js";
import getFinancialYear from "../../src/utils/getFinancialYear.js";

export const config = { api: { bodyParser: false } };

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || typeof signature !== "string") {
      return res.status(400).json({ error: "Missing webhook signature" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const isValidSignature =
      expectedSignature.length === signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(signature, "utf8"),
      );
    if (!isValidSignature)
      return res.status(400).json({ error: "Invalid signature" });

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const transactionId = payment.id;
      const amountInRupees = payment.amount / 100;
      const method = payment.method || "unknown";
      const paymentDate = new Date(payment.created_at * 1000);
      const notes = payment.notes || {};
      const attemptId = notes.attemptId;
      const attempt = attemptId
        ? await prisma.paymentAttempt.findUnique({ where: { id: attemptId } })
        : null;

      // For orders created after the security rollout, only use the trusted
      // server-side attempt record. This prevents tampered checkout notes from
      // being persisted in a receipt, even when the webhook itself is valid.
      if (
        attemptId &&
        (!attempt ||
          attempt.orderId !== payment.order_id ||
          attempt.amountInPaise !== payment.amount)
      ) {
        console.error("Ignoring payment with invalid order-attempt binding", {
          paymentId: transactionId,
          orderId: payment.order_id,
        });
        return res.status(200).json({ status: "ignored" });
      }

      const existing = await prisma.donation.findUnique({
        where: { transactionId },
      });

      if (!existing) {
        const financialYear = getFinancialYear();
        const counter = await prisma.counter.upsert({
          where: { financialYear },
          update: { seq: { increment: 1 } },
          create: { financialYear, seq: 1 },
        });

        const serialNumber = counter.seq.toString().padStart(3, "0");
        const receiptNumber = `RELF/FY ${financialYear}/${serialNumber}`;

        await prisma.donation.create({
          data: {
            transactionId: transactionId,
            amount: new Prisma.Decimal(amountInRupees),
            name: attempt?.name || notes.name || "N/A",
            email: attempt?.email || notes.email || "N/A",
            contact: attempt?.contact || notes.contact || "N/A",
            address: attempt?.address || notes.address || "N/A",
            reason: attempt?.reason || notes.reason || "N/A",
            method: method,
            date: paymentDate,
            receiptNumber: receiptNumber,
          },
        });
      }

      if (attempt) {
        await prisma.paymentAttempt.update({
          where: { id: attempt.id },
          data: { status: "CAPTURED" },
        });
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
}
