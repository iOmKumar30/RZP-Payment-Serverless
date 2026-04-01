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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md animate-slideUp">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full mt-6 mb-3 py-2 rounded font-semibold transition ${
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
          className="w-full py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
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
