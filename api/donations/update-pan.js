import prisma from "../../lib/prisma.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { transactionId, pan } = req.body;

  if (!transactionId || !pan) {
    return res
      .status(400)
      .json({ error: "Transaction ID and PAN are required" });
  }

  try {
    const updatedDonation = await prisma.donation.update({
      where: { transactionId: transactionId },
      data: { pan: pan },
    });

    res
      .status(200)
      .json({ message: "PAN updated successfully", donation: updatedDonation });
  } catch (error) {
    console.error("Error updating PAN:", error);
    res
      .status(404)
      .json({ error: "Donation record not found or update failed." });
  }
}
