import prisma from "../../lib/prisma.js"; 


export default async function handler(_req, res) {
  const data = await prisma.donation.findMany({
    orderBy: { date: "desc" },
    take: 10,
  });

  res.json(data);
}
