import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Receipt from "../components/Receipt";
import useBackButtonWarning from "../hooks/useBackButtonWarning";

const ReceiptPage = () => {
  useBackButtonWarning(true);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="min-h-screen bg-slate-200 pb-20">
      <div className="pt-10 pb-6">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center flex items-center justify-center gap-3">
          <span className="text-4xl">🧾</span> Donation Receipt
        </h2>
        <p className="text-center text-slate-500 mt-2">
          Your receipt has been generated successfully.
        </p>
      </div>

      {/* Container that is wide enough to hold the A4 Receipt */}
      <div className="flex justify-center px-4">
        <Receipt paymentDetails={state} />
      </div>
    </div>
  );
};

export default ReceiptPage;
