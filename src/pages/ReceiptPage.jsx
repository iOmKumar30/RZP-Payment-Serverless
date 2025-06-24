// ReceiptPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Receipt from "../components/Receipt";
import { useEffect } from "react";
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

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <h2 className="text-2xl font-bold -mb-11 text-center">
        🧾 Donation Receipt
      </h2>
      {state && <Receipt paymentDetails={state} />}
    </div>
  );
};

export default ReceiptPage;
