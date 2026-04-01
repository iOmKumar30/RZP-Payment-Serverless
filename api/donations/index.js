import { Prisma } from "@prisma/client";
import crypto from "crypto";
import prisma from "../../lib/prisma.js";
import getFinancialYear from "../../src/utils/getFinancialYear.js";
function serializeDonation(d) {
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
  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
