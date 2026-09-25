import prisma from "../../lib/prisma.js";
import { enforceCors, validatePanUpdate } from "../_lib/security.js";

export default async function handler(req, res) {
  if (!enforceCors(req, res, ["POST", "OPTIONS"])) return;
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const validation = validatePanUpdate(req.body);
  if (validation.error) return res.status(400).json({ error: validation.error });
  const { transactionId, pan, gstno } = validation.data;

  try {
    const updatedDonation = await prisma.donation.update({
      where: { transactionId: transactionId },
      data: {
        pan,
        gstno,
      },
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
