import prisma from "../../lib/prisma.js"; 
import { requireAdminSession } from "../_lib/security.js";


export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
  const data = await prisma.donation.findMany({
    orderBy: { date: "desc" },
    take: 10,
  });

  res.json(data);
}
