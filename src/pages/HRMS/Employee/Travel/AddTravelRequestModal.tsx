/** @format */
import axios from "axios";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const AddTravelRequestModal = ({ open, onClose, data, onSuccess }: any) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    purpose: data?.purpose || "",
    destination: data?.destination || "",
    fromDate: data?.fromDate
      ? new Date(data.fromDate).toISOString().split("T")[0]
      : "",
    toDate: data?.toDate
      ? new Date(data.toDate).toISOString().split("T")[0]
      : "",
    remarks: data?.remarks || "",
  });

  const submit = async () => {
    if (data) {
      await axios.put(`${API_BASE}/travel-requests/${data._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(
        `${API_BASE}/travel-requests`,
        { ...form, status: "PENDING" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    onSuccess();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-5">
          {data ? "View / Edit Travel Request" : "Add Travel Request"}
        </h3>

        <div className="space-y-4">
          {/* PURPOSE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Purpose of Travel
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            />
          </div>

          {/* DESTINATION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Destination
            </label>
            <input
              className="w-full border rounded p-2 text-sm"
              value={form.destination}
              onChange={(e) =>
                setForm({ ...form, destination: e.target.value })
              }
            />
          </div>

          {/* FROM DATE */}
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="w-full border rounded p-2 text-sm"
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
            />
          </div>

          {/* TO DATE */}
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="w-full border rounded p-2 text-sm"
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
          </div>

          {/* REMARKS */}
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-primary text-white rounded text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTravelRequestModal;
