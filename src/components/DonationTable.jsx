import React from "react";

const DonationTable = ({ donations, page, pageSize }) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full border border-gray-300 text-sm text-left">
        <thead className="bg-blue-100 text-gray-700">
          <tr>
            <th className="p-2 border">SI NO.</th>
            <th className="p-2 border">RECEIPT NO.</th>
            <th className="p-2 border">PAN</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Mode</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Date</th>
          </tr>
        </thead>
        <tbody>
          {donations && donations.length > 0 ? (
            donations.map((d, i) => (
              <tr key={d._id} className="hover:bg-gray-50">
                <td className="p-2 border">{(page - 1) * pageSize + i + 1}</td>
                <td className="p-2 border">{d.receiptNumber}</td>
                <td className="p-2 border">{d.pan || "-"}</td>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border">{d.address}</td>
                <td className="p-2 border">{d.reason}</td>
                <td className="p-2 border">{d.method?.toUpperCase()}</td>
                <td className="p-2 border">
                  ₹{parseFloat(d.amount).toFixed(2)}
                </td>
                <td className="p-2 border">
                  {new Date(d.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="p-4 text-center text-gray-500 text-4xl"
              >
                No donations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DonationTable;
