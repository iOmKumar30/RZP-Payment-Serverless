import axios from "axios";
import { useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/relearn_logo.png";
import "../styles/PaymentForm.css";
import { loadRazorpay } from "../utils/loadRazorpay";
import "./PaymentForm.css"; // Custom CSS for animations
const PaymentForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const receiptRef = useRef();
  const [tId, settId] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const navigate = useNavigate();
  const otherReasonRef = useRef(null);
  const handlePayment = async () => {
    const res = await loadRazorpay(
      "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    let result;
    try {
      result = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payment/create-order`,
        {
          amount: parseFloat(amount),
          name,
          email,
          contact,
          address,
          reason: purpose === "Other" ? otherReason : purpose,
        },
        { timeout: 60000 },
      );
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
      console.error("Error creating Razorpay order:", error);
      setIsLoading(false);
      return;
    }

    const { amount: orderAmount, id: order_id, currency } = result.data;
    const reason = purpose === "Other" ? otherReason : purpose;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderAmount.toString(),
      currency,
      name: name,
      description: reason,
      order_id,
      handler: async function (response) {
        const details = {
          name,
          contact,
          email,
          address,
          amount: parseFloat(amount),
          reason,
          method: selectedMethod,
          transactionId: response.razorpay_payment_id,
          date: new Date().toISOString(),
        };

        settId(response.razorpay_payment_id);
        setPaymentDone(true);

        setName("");
        setAddress("");
        setAmount("");
        setPurpose("");
        setSelectedMethod("");
        setContact("");
        setEmail("");

        navigate("/pancard", { state: details });

        sessionStorage.setItem("transaction_id", response.razorpay_payment_id);
        toast.success("Payment successful! Receipt Generated...");
      },

      prefill: {
        name,
        email,
        contact,
      },
      notes: {
        address,
      },
      theme: {
        color: "#3399cc",
      },
      method: {
        netbanking: selectedMethod === "netbanking",
        card: selectedMethod === "card",
        upi: selectedMethod === "upi",
        wallet: selectedMethod === "wallet",
        paylater: selectedMethod === "paylater",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isNaN(parseFloat(amount))) {
      toast.error("Amount must be a valid number");
      return;
    }

    if (
      !name ||
      !address ||
      !amount ||
      !purpose ||
      !selectedMethod ||
      !contact ||
      !email
    ) {
      toast.error("Please fill all the fields");
      return;
    }

    if (purpose === "Other" && !otherReason.trim()) {
      toast.error("Please specify your purpose in the 'Other' field.");
      return;
    }

    setIsLoading(true);

    try {
      await handlePayment();
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slideUp w-full bg-gradient-to-br from-white via-gray-100 to-white shadow-xl rounded-2xl max-w-2xl mx-auto p-4 sm:p-8 border border-emerald-100">
      <div className="mb-6 flex flex-col items-center sm:mb-8">
        <img
          src={logo}
          alt="Relearn Logo"
          className="mb-3 h-20 w-20 animate-fadeInScale object-contain sm:mb-4 sm:h-28 sm:w-28"
        />
        <h2 className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-400 sm:text-4xl">
          Make a Donation
        </h2>
        <p className="text-sm text-gray-500 mt-2 animate-fadeInScale delay-200">
          Support our mission ✨
        </p>{" "}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Donor's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              pattern="[0-9]{10}"
              inputMode="numeric"
              value={contact}
              onChange={(e) => {
                const cleanedValue = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);
                setContact(cleanedValue);
              }}
              className="mt-1 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="john@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="123 Street, City"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) >= 1 || value === "") {
                  setAmount(value);
                }
              }}
              className="mt-1 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="1000.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PAY VIA
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-md border px-4 py-2"
            >
              <option value="" disabled hidden>
                Select a Method
              </option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Purpose of Donation
          </label>
          <select
            required
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              setTimeout(() => {
                otherReasonRef.current?.focus();
              }, 0);
            }}
            className="mt-1 min-h-11 w-full rounded-md border px-4 py-2"
          >
            <option value="" disabled hidden>
              Select a Purpose
            </option>
            <option value="Membership">Membership</option>
            <option value="Sahaaj Pathshala">Sahaaj Pathshala</option>
            <option value="Sahaaj Poshan">Sahaaj Poshan</option>
            <option value="Environment">Environment</option>
            <option value="Empowerment">Empowerment</option>
            <option value="Education aids">Education aids</option>
            <option value="Corpus">Corpus</option>
            <option value="Other">Other</option>
          </select>
          {purpose === "Other" && (
            <input
              type="text"
              ref={otherReasonRef}
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-500"
              placeholder="Purpose"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`min-h-12 w-full cursor-pointer rounded-lg py-3 font-semibold text-white transition-all flex items-center justify-center
      ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 shadow-md"
      }`}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin h-5 w-5" />
          ) : (
            "Donate"
          )}
        </button>
      </form>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default PaymentForm;
