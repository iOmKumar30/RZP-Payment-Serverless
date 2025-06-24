import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/donations`;

export const fetchRecentDonations = async () => {
  try {
    const response = await axios.get(`${API_BASE}/recent`);
    return response.data;
  } catch (error) {
    toast.error("Error fetching recent donations", { autoClose: 1500 });
    console.error("Error fetching recent donations:", error);
    throw error;
  }
};

export const fetchFilteredDonations = async (
  from,
  to,
  skip = 0,
  limit = 10,
  search = ""
) => {
  try {
    const response = await axios.get(`${API_BASE}`, {
      params: { from, to, skip, limit, search: encodeURIComponent(search) },
    });
    return response.data;
  } catch (error) {
    toast.error("Error fetching filtered donations", { autoClose: 1500 });
    console.error("Error fetching filtered donations:", error);
    throw error;
  }
};

export const downloadExcel = async (from, to) => {
  try {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const url = `${API_BASE}/download?${params.toString()}`;
    toast.info("Preparing Excel file...", { autoClose: 1500 });
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  } catch (error) {
    toast.error("Error downloading Excel file", {
      autoClose: 1500,
    });
    console.error("Error downloading Excel file:", error);
    throw error;
  }
};

export const downloadAllExcel = async () => {
  try {
    toast.info("Preparing full Excel file...", { autoClose: 1500 });

    const link = document.createElement("a");
    link.href = `${API_BASE}/download`;
    link.target = "_blank";
    link.click();
  } catch (error) {
    toast.error("Error downloading full Excel file", error);
  }
};

export const saveDonation = async (donationData) => {
  try {
    const response = await axios.post(API_BASE, donationData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    toast.error("Error saving donation", { autoClose: 1500 });
    console.error("Error saving donation:", error);
    throw error;
  }
};
