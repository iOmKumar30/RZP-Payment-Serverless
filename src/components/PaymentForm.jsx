import React, { useState, useRef, use } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./PaymentForm.css"; // Custom CSS for animations
import { loadRazorpay } from "../utils/loadRazorpay";
import axios from "axios";
import Receipt from "./Receipt";
import { useNavigate } from "react-router-dom";
import logo from "../assets/relearn_logo-removebg-preview.png";
import "../styles/PaymentForm.css";
import useBackButtonWarning from "../hooks/useBackButtonWarning";
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
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    // Create order from backend
    // "https://rzp-payment-backend.onrender.com/api/payment/create-order"
    let result;
    try {
      result = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/payment/create-order`,
        { amount: parseFloat(amount) },
        { timeout: 60000 }
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
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // use VITE_ prefix in .env
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
    <div className="animate-slideUp bg-gradient-to-br from-white via-gray-100 to-white shadow-xl rounded-2xl max-w-2xl mx-auto p-8 mt-16 border border-blue-100">
      <div className="flex flex-col items-center mb-8">
        <img
          src={logo}
          alt="Relearn Logo"
          className="w-30 h-30 mb-4 animate-fadeInScale"
        />
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-400">
          Make a Donation
        </h2>
        <p className="text-sm text-gray-500 mt-2 animate-fadeInScale delay-200">
          Support our mission ✨
        </p>{" "}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Donor's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              placeholder="123 Street, City"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
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
              className="w-full px-4 py-2 mt-1 border rounded-md"
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
            className="w-full px-4 py-2 mt-1 border rounded-md"
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
              className="w-full px-4 py-2 mt-1 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              placeholder="Purpose"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`transition-all w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center cursor-pointer
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
