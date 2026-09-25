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
      <div className="px-4 pt-7 pb-5 sm:pt-10 sm:pb-6">
        <h2 className="flex items-center justify-center gap-2 text-center text-2xl font-extrabold text-slate-800 sm:gap-3 sm:text-3xl">
          <span className="text-3xl sm:text-4xl">🧾</span> Donation Receipt
        </h2>
        <p className="text-center text-slate-500 mt-2">
          Your receipt has been generated successfully.
        </p>
      </div>

      {/* The receipt scales to the available viewport width while retaining its A4 PDF output. */}
      <div className="mx-auto w-full px-3 pb-2 sm:px-4">
        <Receipt paymentDetails={state} />
      </div>
    </div>
  );
};

export default ReceiptPage;
