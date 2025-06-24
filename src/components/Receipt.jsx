import React from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import headerImage from "../assets/relearn_header.png";
import { ToWords } from "to-words";
const Receipt = React.forwardRef(({ paymentDetails }, ref) => {
  const downloadImage = () => {
    const receiptElement = document.getElementById("receipt");

    setTimeout(() => {
      html2canvas(receiptElement, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
        windowWidth: receiptElement.scrollWidth,
        windowHeight: receiptElement.scrollHeight,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdfWidth = 595.28; // A4 width in px at 72 DPI
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: [pdfWidth, pdfHeight],
          });

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("RELF-donation-receipt.pdf");
        })
        .catch((error) => {
        });
    }, 500);
  };

  const toWords = new ToWords({
    localeCode: "en-IN",
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    },
  });
  const isoDate = paymentDetails.date;
  const formattedDate = new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedDateandTime = new Date(isoDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <>
      <div
        id="capture-wrapper"
        className="bg-gray-100 min-h-screen flex items-center justify-center py-15 px-4 "
      >
        <div
          ref={ref}
          id="receipt"
          className="bg-white border border-gray-300 shadow-xl pt-0 px-8 pb-8 rounded-lg w-full max-w-2xl text-gray-800 font-sans leading-relaxed animate-slideUp"
        >
          <div className="text-center mb-6">
            <img
              src={headerImage}
              alt="Relearn Foundation Header"
              className="w-full max-w-full"
            />
          </div>

          <div className="text-left text-sm text-black mb-6 leading-relaxed space-y-1">
            <p>
              <strong>Relearn Foundation</strong>
            </p>
            <p className="text-black font-semibold">
              2681, Vijaya Gardens, Baridih, Jamshedpur, Jharkhand 831017
            </p>
            <p className="text-black font-semibold">PAN: AACTR5805Q</p>
            <p className="text-black font-semibold">
              80G Registration Number: AACTR5805Q23PT02 dated 22-05-2024
            </p>
            <p className="text-black font-semibold">
              12A Registration Number: AACTR5805Q23PT01 dated 22-05-2024
            </p>
            <p className="text-black font-semibold">GST No: 20AACTR5805Q2Z9</p>
            <p className="text-black font-semibold">
              CSR-1: CSR00012310 (MINISTRY OF CORPORATE AFFAIRS)
            </p>
          </div>

          <hr className="my-4 border-t-2 border-black" />

          <hr className="my-4 border-t-2 border-black" />

          <div className="flex justify-between items-center text-sm font-medium text-gray-800 mb-4">
            <p>
              Receipt No: <span>{paymentDetails.receiptNumber}</span>
            </p>
            <p>
              Date: <span>{formattedDate}</span>
            </p>
          </div>

          <div className="text-gray-800 text-sm leading-relaxed mb-6">
            <h2 className="text-lg font-semibold mb-2 text-center">
              <strong>Donation Receipt</strong>
            </h2>
            <p className="mb-3 font-semibold">Thank you for your donation.</p>
            <p>
              The amount you have given will make a difference as the proceeds
              help the Relearn Foundation to implement our mission in the areas
              of Education, Environment and Empowerment. This receipt is an
              attestation that we have gratefully received your generous
              contribution. Keep this receipt for your tax filing purposes.
            </p>
          </div>

          <div className="mb-4 text-sm">
            <p>
              <strong>Purpose:</strong> {paymentDetails.reason}
            </p>
            <p>
              <strong>Donor's Name:</strong> {paymentDetails.name}
            </p>
            <p>
              <strong>Donor's Address:</strong> {paymentDetails.address}
            </p>
            {paymentDetails.pan && (
              <p>
                <strong>Donor's PAN No:</strong> {paymentDetails.pan}
              </p>
            )}
            <p>
              <strong>Donor's Mobile No:</strong> {paymentDetails.contact}
            </p>
            <p>
              <strong>Donor's Email:</strong> {paymentDetails.email}
            </p>
          </div>

          <div className="mb-4 text-sm">
            <p>
              <strong>Donation Amount:</strong> ₹
              {parseFloat(paymentDetails.amount).toFixed(2)}
            </p>
            <p>
              <strong>In words:</strong>{" "}
              {toWords.convert(paymentDetails.amount)}
            </p>

            <p>
              <strong>Mode of Payment:</strong>{" "}
              {paymentDetails.method?.toUpperCase()}
            </p>
            <p>
              <strong>Transaction Ref No.:</strong>{" "}
              {paymentDetails.transactionId || "N/A"}
            </p>
            <p>
              <strong>Date Received:</strong> {formattedDateandTime}
            </p>
          </div>

          <div className="mt-6 text-sm text-gray-800 leading-relaxed">
            <p className="font-semibold">Authorized Signatory</p>
            <p>Name: Dr Mita Tarafder</p>
            <p>Mobile No: 9852193175</p>

            <hr className="my-4 border-t border-gray-400" />

            <p className="italic text-gray-600">
              Donations made to Relearn Foundation (PAN-AACTR5805Q) are eligible
              for tax deduction under section 12A/80G. This is an autogenerated
              receipt.
            </p>
          </div>

          <div className="mt-10 text-xs text-gray-600 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="flex-grow border-t border-gray-400 mx-2"></div>
              <span>relearn2015@gmail.com &nbsp; | &nbsp; +91-9334041104</span>
              <div className="flex-grow border-t border-gray-400 mx-2"></div>
            </div>
            <p>
              2681 Vijaya Garden, Baridih, Jamshedpur - 831017 &nbsp;{" "}
              <span className="ml-2">
                Reg No: <strong>755/160</strong>
              </span>
            </p>
            <p className="mt-1">
              Website:{" "}
              <a
                href="https://relf.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                https://relf.in/
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={downloadImage}
          className="px-6 py-3 text-white font-semibold rounded-lg shadow bg-blue-600 hover:bg-blue-700 transition cusror-pointer"
        >
          Download PDF
        </button>
      </div>
    </>
  );
});

export default Receipt;
