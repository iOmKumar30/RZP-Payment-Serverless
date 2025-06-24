import prisma from "../../lib/prisma.js";
import { buildExcel } from "../../src/utils/excel.js";

export default async function handler(req, res) {
  const { from, to } = req.query;
  const where = {};

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to + "T23:59:59.999Z");
  }

  const data = await prisma.donation.findMany({
    where,
    orderBy: { date: "desc" },
  });

  const formatted = data.map((d, i) => ({
    "SI NO.": i + 1,
    "RECEIPT NO.": d.receiptNumber,
    "PANCARD NO. Of Donor": d.pan || "-",
    "Name of Donor": d.name,
    "Address of Donor": d.address,
    "Type of Donation": d.reason,
    "Mode of Receipt": d.method,
    "Amount of donation (INR)": Number(d.amount).toFixed(2),
    "Date of Payment": new Date(d.date).toLocaleDateString("en-IN"),
  }));

  const buffer = await buildExcel(formatted);

  res.setHeader("Content-Disposition", "attachment; filename=donations.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
}
