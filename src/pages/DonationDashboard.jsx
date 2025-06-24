import React, { useEffect, useState } from "react";
import DonationTable from "../components/DonationTable";
import {
  fetchRecentDonations,
  fetchFilteredDonations,
  downloadExcel,
  downloadAllExcel,
} from "../services/donationAPI";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import "react-toastify/dist/ReactToastify.css";
const DonationDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const getRecent = async (customFrom = from, customTo = to) => {
    setLoading(true);
    try {
      const res = await fetchFilteredDonations(
        customFrom,
        customTo,
        (page - 1) * pageSize,
        pageSize,
        ""
      );
      setDonations(res.data);
      setTotalCount(res.totalCount);
    } catch (error) {
      console.error("Error fetching recent donations:", error);
      toast.error("Error fetching donations");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = async () => {
    if (isFilterApplied) {
      setIsFilterApplied(false);
      setFrom("");
      setTo("");
      setPage(1);
      await getRecent("", "");
    } else {
      setPage(1);
      try {
        await getRecent(from, to);
        setIsFilterApplied(true);
      } catch (error) {
        console.error("Error applying filter:", error);
        toast.error("Error applying filter! Please try again.");
      }
    }
  };

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const res = await fetchFilteredDonations(
        "",
        "",
        (page - 1) * pageSize,
        pageSize,
        search
      );
      setDonations(res.data);
      setTotalCount(res.totalCount);
    } catch (error) {
      console.error("Error searching donations:", error);
      toast.error("Error searching donations");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const maxPage = Math.ceil(totalCount / pageSize);
    if (page > maxPage && maxPage > 0) {
      setPage(maxPage);
    }
  }, [totalCount, page, pageSize]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim() !== "") {
        fetchSearch();
      } else {
        getRecent(); // when search cleared, show normal list
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, page, pageSize]);

  return (
    <div className="min-h-screen pt-6 px-4 w-full mx-auto bg-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center flex-grow text-gray-800">
          🧾 Donation Records
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("relf_admin");
            window.location.href = "/admin/login";
          }}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center mb-6">
        <div>
          <label className="block text-sm font-medium">From:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="pt-4.5">
          <button
            onClick={applyFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isFilterApplied ? "Remove Filter" : "Apply Filter"}
          </button>
        </div>
        <div className="pt-4.5">
          <button
            onClick={() => downloadExcel(from, to)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={!isFilterApplied}
          >
            Download Filtered
          </button>
        </div>
        <div className="pt-4.5">
          <button
            onClick={downloadAllExcel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Download All
          </button>
        </div>
        <div className="relative w-64 pt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="border border-black p-2 rounded-full w-full pr-10 pl-4 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
          />
          {search && (
            <div className="absolute inset-y-0 right-2 flex items-center space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-500 hover:text-gray-700 text-lg focus:outline-none"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto animate-slideUp">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <BeatLoader size={20} color="#3b82f6" />
          </div>
        ) : (
          <DonationTable
            donations={donations}
            page={page}
            pageSize={pageSize}
          />
        )}

        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={() => {
              setLoading(true);
              setPage((prev) => Math.max(prev - 1, 1));
            }}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="flex items-center">
            Page {page} of {Math.ceil(totalCount / pageSize)}
          </span>

          <button
            onClick={() => {
              setLoading(true);
              setPage((prev) => prev + 1);
            }}
            disabled={page >= Math.ceil(totalCount / pageSize)}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default DonationDashboard;
