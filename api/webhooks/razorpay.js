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

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const transactionId = payment.id;
      const amountInRupees = payment.amount / 100;
      const notes = payment.notes;

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
            name: notes.name,
            email: notes.email,
            contact: notes.contact,
            address: notes.address,
            reason: notes.reason,
            receiptNumber: receiptNumber,
          },
        });
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
}
