// api/donations/index.js (JavaScript version)

import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import getFinancialYear from "../../src/utils/getFinancialYear.js";

function serializeDonation(d) {
  // Ensure Decimal is safe for JSON
  return {
    ...d,
    amount:
      d && d.amount && typeof d.amount.toString === "function"
        ? d.amount.toString()
        : String(d.amount),
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let { from, to, skip = 0, limit = 10, search = "" } = req.query || {};

      const where = {};
      search = decodeURIComponent(search || "");

      if (from && to) {
        where.date = {
          gte: new Date(from),
          lte: new Date(to + "T23:59:59.999Z"),
        };
      }

      if (search) {
        const searchWords = search.trim().split(/\s+/).filter(Boolean);
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { pan: { contains: search, mode: "insensitive" } },
          { reason: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { contact: { contains: search, mode: "insensitive" } },
          { receiptNumber: { contains: search, mode: "insensitive" } },
          ...searchWords.map((word) => ({
            AND: [
              {
                OR: [
                  { name: { contains: word, mode: "insensitive" } },
                  { address: { contains: word, mode: "insensitive" } },
                  { pan: { contains: word, mode: "insensitive" } },
                  { reason: { contains: word, mode: "insensitive" } },
                  { email: { contains: word, mode: "insensitive" } },
                  { contact: { contains: word, mode: "insensitive" } },
                  { receiptNumber: { contains: word, mode: "insensitive" } },
                ],
              },
            ],
          })),
        ];
      }

      const data = await prisma.donation.findMany({
        where,
        orderBy: { date: "desc" },
        skip: parseInt(String(skip), 10),
        take: parseInt(String(limit), 10),
      });

      const totalCount = await prisma.donation.count({ where });

      res.json({ data: data.map(serializeDonation), totalCount });
    } catch (error) {
      console.error("Error listing donations:", error);
      res.status(500).json({ error: "Error listing donations" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const { transactionId } = req.body || {};

      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      const existingDonation = await prisma.donation.findUnique({
        where: { transactionId },
      });

      if (existingDonation) {
        return res
          .status(409)
          .json({ error: "This transaction has already been processed." });
      }

      const financialYear = getFinancialYear();

      const counter = await prisma.counter.upsert({
        where: { financialYear },
        update: { seq: { increment: 1 } },
        create: { financialYear, seq: 1 },
      });

      const serialNumber = counter.seq.toString().padStart(3, "0");
      const receiptNumber = `RELF/FY ${financialYear}/${serialNumber}`;

      // Accept amount as string or number; convert to Decimal precisely
      const rawAmount = req.body && req.body.amount;
      if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
        return res.status(400).json({ error: "Amount is required" });
      }

      // Optional: simple validation for up to 2 decimal places
      const amtStr = String(rawAmount);
      if (!/^\d+(\.\d{1,2})?$/.test(amtStr)) {
        return res
          .status(400)
          .json({ error: "Amount must be a number with up to 2 decimals" });
      }

      const amountDecimal = new Prisma.Decimal(amtStr);

      const donation = await prisma.donation.create({
        data: {
          ...req.body,
          amount: amountDecimal, // store Decimal
          receiptNumber,
        },
      });

      res.status(201).json({
        message: "Donation saved",
        donation: serializeDonation(donation),
        receiptNumber,
      });
    } catch (error) {
      console.error("Error saving donation:", error);
      res.status(500).json({ error: "Error saving donation" });
    }
    return;
  }

  // Method not allowed
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
