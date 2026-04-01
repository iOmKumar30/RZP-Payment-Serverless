import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ToWords } from "to-words";
import headerImage from "../assets/relearn_header.png";
import signatureImage from "../assets/sign_left.png";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  },
});

const Receipt = () => {
  const { state: data } = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!data) return <div className="text-center mt-10">No data found</div>;

  const isoDate = new Date(data.date);
  const formattedDate = isoDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedDateTime = isoDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const handleDownload = async () => {
    const element = document.getElementById("donation-receipt-root");
    if (!element) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = 595.28; // A4 Width in pts
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Donation_${data.receiptNumber || "Receipt"}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen py-10">
      <div
        id="donation-receipt-root"
        className="bg-white text-gray-800 font-sans leading-relaxed mx-auto border border-gray-300 shadow-sm flex flex-col justify-between relative animate-slideUp"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "0",
        }}
      >
        <div className="relative w-full mb-4 shrink-0">
          <img
            src={headerImage}
            alt="Header"
            className="w-full h-auto block"
          />
        </div>

        <div className="px-12 flex-1 flex flex-col">
          <div className="text-left text-sm text-black mb-4 leading-snug space-y-1">
            <h1 className="font-bold text-lg mb-1 uppercase">
              Relearn Foundation
            </h1>
            <p>2681, Vijaya Gardens, Baridih, Jamshedpur, Jharkhand 831017</p>
            <p>
              <span className="font-semibold">PAN:</span> AACTR5805Q
            </p>
            <p>
              <span className="font-semibold">80G Reg:</span> AACTR5805Q23PT02
              (22-05-2024)
            </p>
            <p>
              <span className="font-semibold">GST No:</span> 20AACTR5805Q2Z9
            </p>
            <p>
              <span className="font-semibold">CSR-1:</span> CSR00012310
            </p>
          </div>

          <hr className="my-2 border-t-2 border-black" />

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-6">
            <p>Receipt No: {data.receiptNumber}</p>
            <p>Date: {formattedDate}</p>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6 uppercase tracking-widest">
            Donation Receipt
          </h2>

          <div className="text-sm text-gray-800 mb-6 space-y-3">
            <p className="font-bold">Dear {data.name},</p>
            <p className="text-justify leading-relaxed">
              The amount you have given will help Relearn Foundation implement
              missions in Education, Environment, and Empowerment. This receipt
              serves as an attestation of your generous contribution for tax
              filing purposes.
            </p>
          </div>

          <div className="text-sm space-y-2 mb-8">
            {[
              ["Purpose", data.reason],
              ["Donor Name", data.name],
              ["Address", data.address],
              ["PAN No", data.pan],
              ["GST No", data.gstno],
              ["Mobile No", data.contact],
              ["Email", data.email],
            ].map(
              ([label, value]) =>
                value && (
                  <div key={label} className="grid grid-cols-[140px_1fr]">
                    <span className="font-bold">{label}:</span>
                    <span>{value}</span>
                  </div>
                ),
            )}
          </div>

          <div className="text-sm space-y-2 mb-8 bg-gray-50 p-6 rounded border border-gray-200">
            <div className="grid grid-cols-[180px_1fr] items-center">
              <span className="font-bold text-gray-600">Donation Amount:</span>
              <span className="font-bold text-xl text-green-700">
                ₹
                {Number(data.amount).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr]">
              <span className="font-bold text-gray-600">In Words:</span>
              <span className="capitalize italic">
                {toWords.convert(Number(data.amount))}
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr]">
              <span className="font-bold text-gray-600">Transaction ID:</span>
              <span className="font-mono text-xs">{data.transactionId}</span>
            </div>
          </div>

          <div className="mt-auto mb-4">
            <div className="mb-6">
              <p className="font-bold mb-1">Authorized Signatory</p>

              <div className="h-16 flex items-center justify-start mt-1 mb-1">
                <img
                  src={signatureImage}
                  alt="Signature"
                  className="max-h-14 w-auto object-contain" 
                />
              </div>

              <p className="font-semibold">Dr Mita Tarafder</p>
              <p className="text-xs text-gray-600">Mobile: +91-9852193175</p>
            </div>
            <hr className="border-t border-gray-400 mb-2" />
            <p className="text-[10px] italic text-gray-500 text-center leading-tight">
              Donations made to Relearn Foundation (PAN-AACTR5805Q) are eligible
              for tax deduction under Section 80G. This is a computer-generated
              receipt and does not require a physical signature.
            </p>
          </div>
        </div>

        <div className="w-full py-6 text-center text-[10px] text-gray-500 bg-white shrink-0">
          <div className="flex items-center justify-center mb-1 gap-2 px-12">
            <div className="h-px bg-gray-200 grow"></div>
            <span className="font-semibold whitespace-nowrap">
              relearn2015@gmail.com | +91-9334041104 | relf.in
            </span>
            <div className="h-px bg-gray-200 grow"></div>
          </div>
          <p>
            2681 Vijaya Garden, Baridih, Jamshedpur - 831017 | Reg No: 755/160
          </p>
        </div>
      </div>

      <div className="text-center mt-8 mb-16">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`px-8 py-3 font-bold rounded-full shadow-lg transition transform hover:scale-105 ${
            isDownloading
              ? "bg-gray-400"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isDownloading
            ? "Generating Official PDF..."
            : "Download Official PDF Receipt"}
        </button>
      </div>
    </div>
  );
};

export default Receipt;
