import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ToWords } from "to-words";
import headerImage from "../assets/relearn_header.png";
import signatureImage from "../assets/sign_left.png";
import stampImage from "../assets/stamp.jpeg"; // <-- NEW ASSET IMPORTED HERE

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
      // scale: 3 forces a much higher resolution capture for crisp text
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // 1.0 forces maximum JPEG quality, keeping it sharp but smaller than PNG
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imageRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      const imageWidth =
        imageRatio > pageRatio ? pageWidth : pageHeight * imageRatio;
      const imageHeight =
        imageRatio > pageRatio ? pageWidth / imageRatio : pageHeight;
      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

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
        className="bg-white text-gray-800 font-sans leading-relaxed mx-auto flex flex-col justify-between relative"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "0",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Header (Full Width) */}
        <div className="relative w-full mb-4 shrink-0">
          <img
            src={headerImage}
            alt="Relearn Foundation Header"
            className="block w-full h-auto"
          />
        </div>

        {/* 2. Main Content */}
        <div className="px-12 flex-1 flex flex-col">
          <div className="text-left text-sm text-black mb-4 leading-snug space-y-1">
            <h1 className="font-bold text-lg mb-1">Relearn Foundation</h1>
            <p>2681, Vijaya Gardens, Baridih, Jamshedpur, Jharkhand 831017</p>
            <p>
              <span className="font-semibold">PAN:</span> AACTR5805Q
            </p>
            <p>
              <span className="font-semibold">80G Registration Number:</span>{" "}
              AACTR5805Q25PT02
            </p>
            <p>
              <span className="font-semibold">12A Registration Number:</span>{" "}
              AACTR5805Q25PT01
            </p>
            <p>
              <span className="font-semibold">GST No:</span> 20AACTR5805Q2Z9
            </p>
            <p>
              <span className="font-semibold">CSR-1:</span> CSR00012310
              (MINISTRY OF CORPORATE AFFAIRS)
            </p>
          </div>

          <hr className="my-3 border-t-2 border-black" />

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-6 mt-2">
            <p>Receipt No: {data.receiptNumber}</p>
            <p>Date: {formattedDate}</p>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6 uppercase tracking-wide">
            Donation Receipt
          </h2>

          <div className="text-sm text-gray-800 mb-6">
            <p className="mb-3 font-bold">Thank you for your donation.</p>
            <p className="text-justify leading-relaxed">
              The amount you have given will make a difference as the proceeds
              help the Relearn Foundation to implement our mission in the areas
              of Education, Environment and Empowerment. This receipt is an
              attestation that we have gratefully received your generous
              contribution. This receipt maybe kept for tax filling purpose.
            </p>
          </div>

          <div className="text-sm space-y-2 mb-6">
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Purpose:</span>
              <span>{data.reason}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Remarks:</span>
              <span>{data.remarks}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Donor Name:</span>
              <span>{data.name}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Address:</span>
              <span>{data.address}</span>
            </div>
            {data.pan && (
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-bold">PAN No:</span>
                <span>{data.pan}</span>
              </div>
            )}
            {data.gstno && data.gstno !== "N/A" && (
              <div className="grid grid-cols-[140px_1fr]">
                <span className="font-bold">GST No:</span>
                <span>{data.gstno}</span>
              </div>
            )}
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Mobile No:</span>
              <span>{data.contact}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr]">
              <span className="font-bold">Email:</span>
              <span>{data.email}</span>
            </div>
          </div>

          <div className="text-sm space-y-2 mb-8 bg-gray-50 p-4 rounded border border-gray-200">
            <div className="grid grid-cols-[160px_1fr]">
              <span className="font-bold">Donation Amount:</span>
              <span className="font-bold text-lg">
                {data.amount != null
                  ? Number(data.amount).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "—"}
              </span>
            </div>
            <div className="grid grid-cols-[160px_1fr]">
              <span className="font-bold">In words:</span>
              <span className="capitalize italic">
                {toWords.convert(Number(data.amount))}
              </span>
            </div>
            <div className="grid grid-cols-[160px_1fr]">
              <span className="font-bold">Mode of Payment:</span>
              <span>{data.method?.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-[160px_1fr]">
              <span className="font-bold">Transaction Ref No:</span>
              <span>{data.transactionId || "N/A"}</span>
            </div>
            <div className="grid grid-cols-[160px_1fr]">
              <span className="font-bold">Date Received:</span>
              <span>{formattedDateTime}</span>
            </div>
          </div>

          {/* Signatory Section - Pushed to bottom of Content area */}
          <div className="mt-auto mb-2">
            <div className="mb-6 flex items-end gap-10">
              <div>
                <p className="font-bold">Authorized Signatory</p>
                <img
                  src={signatureImage}
                  alt="Signature of Dr Mita Tarafder"
                  className="mt-1 h-12 w-40 object-contain object-left"
                />
                <p>Name: Dr Mita Tarafder</p>
                <p>Mobile No: 9852193175</p>
              </div>
              <div className="flex h-28 w-36 items-center justify-center">
                <img
                  src={stampImage}
                  alt="Relearn Foundation stamp"
                  className="max-h-full max-w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
            <hr className="border-t border-gray-400 mb-2" />
            <p className="text-xs italic text-gray-500 text-center">
              Donations made to Relearn Foundation (PAN-AACTR5805Q) are eligible
              for tax deduction under section 12A/80G.
            </p>
          </div>
        </div>

        {/* 3. Footer (Stick to Bottom, no overlap) */}
        <div className="w-full py-4 text-center text-xs text-gray-600 bg-white shrink-0">
          <div className="flex items-center justify-center mb-1 gap-2 px-12">
            <div className="h-px bg-gray-300 grow"></div>
            <span className="whitespace-nowrap font-semibold">
              relearn2015@gmail.com &nbsp; | &nbsp; +91-9334041104
            </span>
            <div className="h-px bg-gray-300 grow"></div>
          </div>
          <p className="mb-1">
            2681 Vijaya Garden, Baridih, Jamshedpur - 831017 &nbsp;{" "}
            <span className="ml-2 font-bold">Reg No: 755/160</span>
            <span className="ml-2 font-bold">
              NGO Darpan ID: H/2017/0115958
            </span>
          </p>
          <p>
            Website:{" "}
            <span className="text-blue-600 font-bold">https://relf.in/</span>
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
