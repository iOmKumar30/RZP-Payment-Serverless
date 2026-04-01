import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { updatePan } from "../services/donationAPI";
const PanPrompt = () => {
  const { state: paymentDetails } = useLocation();
  const navigate = useNavigate();
  const [pan, setPan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  if (!paymentDetails) {
    // if someone lands here directly
    navigate("/");
    return null;
  }

  const handleSubmit = async () => {
    if (isLoading) return; // prevent multiple submissions
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (!panRegex.test(pan)) {
      toast.error("Invalid PAN number. Please enter a valid one.");
      return;
    }
    setIsLoading(true);
    // if PAN is valid, proceed to receipt generation
    const detailsWithPan = { ...paymentDetails, pan };
    let res;
    try {
      res = await updatePan(paymentDetails.transactionId, pan);
    } catch (err) {
      console.error("Error saving donation:", err);
      toast.error("Error saving donation to database!");
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    navigate("/receipt", {
      state: {
        ...detailsWithPan,
        receiptNumber: res.receiptNumber,
      },
    });
  };

  const handleSkip = () => {
    // If they skip, we do nothing because the webhook already created the donation record without PAN
    toast.info("You skipped entering your PAN. Thank you for your donation!");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
          Enter PAN to Generate Receipt
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          PAN is required for tax acknowledgment. You may skip if not
          applicable.
        </p>

        <input
          type="text"
          maxLength="10"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          placeholder="ABCDE1234F"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleSubmit}
          className={`w-full mb-3 py-2 rounded transition 
    ${
      isLoading
        ? "bg-blue-300 text-white cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
    }`}
          disabled={isLoading}
        >
          Generate Receipt
        </button>

        <button
          onClick={handleSkip}
          className={`w-full py-2 rounded transition 
    ${
      isLoading
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer"
    }`}
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
