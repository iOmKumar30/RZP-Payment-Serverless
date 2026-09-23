import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const PanPrompt = () => {
  const { state: paymentDetails } = useLocation();
  const navigate = useNavigate();
  const [pan, setPan] = useState("");
  const [gstno, setGstno] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  if (!paymentDetails) {
    navigate("/");
    return null;
  }

  const handleSubmit = async () => {
    if (isLoading) return;

    // Optional: Only validate PAN if something is entered
    if (pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panRegex.test(pan)) {
        toast.error("Invalid PAN format. Please check again.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/donations/update-pan`,
        {
          transactionId: paymentDetails.transactionId,
          pan: pan || null,
          gstno: gstno || "N/A", // Sending GST to backend
        },
      );

      const updatedDonation = response.data.donation;

      navigate("/receipt", {
        state: {
          ...paymentDetails,
          pan: pan,
          gstno: updatedDonation.gstno,
          receiptNumber: updatedDonation.receiptNumber,
        },
      });
    } catch (err) {
      console.error("Error updating details:", err);
      toast.error("Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info("Proceeding without additional tax details...");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-6">
      <div className="w-full max-w-md animate-slideUp rounded-xl bg-white p-5 shadow-xl sm:p-8">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-2">
          Tax Acknowledgment
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter PAN for 80G benefits or GST for business receipts.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              PAN Number
            </label>
            <input
              type="text"
              maxLength="10"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F (Optional)"
              className="min-h-11 w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase">
              GST Number
            </label>
            <input
              type="text"
              maxLength="15"
              value={gstno}
              onChange={(e) => setGstno(e.target.value.toUpperCase())}
              placeholder="20AACTR5805Q2Z9 (Optional)"
              className="min-h-11 w-full rounded-md border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className={`mt-6 mb-3 min-h-11 w-full rounded py-2 font-semibold transition ${
            isLoading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Generate Receipt"}
        </button>

        <button
          onClick={handleSkip}
          className="min-h-11 w-full rounded bg-gray-200 py-2 text-gray-700 transition hover:bg-gray-300"
          disabled={isLoading}
        >
          Skip & Exit
        </button>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default PanPrompt;
