import prisma from "../../lib/prisma.js";
import getFinancialYear from "../../src/utils/getFinancialYear.js";
export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let { from, to, skip = 0, limit = 10, search = "" } = req.query;
      const where = {};
      search = decodeURIComponent(search);
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
        skip: parseInt(skip),
        take: parseInt(limit),
      });

      const totalCount = await prisma.donation.count({ where });

      res.json({ data, totalCount });
    } catch (error) {
      console.error("Error listing donations:", error);
      res.status(500).json({ error: "Error listing donations" });
    }
  }

  if (req.method === "POST") {
    try {
      const { transactionId } = req.body;

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

      const donation = await prisma.donation.create({
        data: {
          ...req.body,
          amount: parseFloat(req.body.amount),
          receiptNumber,
        },
      });

      res
        .status(201)
        .json({ message: "Donation saved", donation, receiptNumber });
    } catch (error) {
      console.error("Error saving donation:", error);
      res.status(500).json({ error: "Error saving donation" });
    }
  }
}
