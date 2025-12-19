/** @format */

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL;

const AddHolidayModal = ({ isOpen, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const token = localStorage.getItem("token");

  /* ================= SUBMIT HANDLER ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date) {
      alert("Holiday and Date are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE}/holidays`,
        {
          title,
          date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDate("");
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to add holiday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay with BLUR only */}
      <div
        className="fixed inset-0 backdrop-blur-[3px] z-20"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-white w-[420px] rounded-lg shadow-xl relative p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          {/* Heading */}
          <h2 className="text-xl font-semibold mb-6 text-center">
            Add Holiday
          </h2>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Holiday</label>
              <input
                type="text"
                placeholder="Admin Holiday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded-md font-medium hover:bg-orange-600 transition disabled:opacity-60"
            >
              {loading ? "Adding..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddHolidayModal;
