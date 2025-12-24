/** @format */

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  mode: "add" | "view" | "edit";
}

const ViewEditJobModal = ({ isOpen, onClose, job, mode }: Props) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    location: "",
    openings: 1,
    status: "Open",
  });

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && job) {
      setForm({
        jobTitle: job.jobTitle,
        department: job.department,
        location: job.location,
        openings: job.openings,
        status: job.status,
      });
    }

    if (mode === "add") {
      setForm({
        jobTitle: "",
        department: "",
        location: "",
        openings: 1,
        status: "Open",
      });
    }
  }, [job, mode]);

  if (!isOpen) return null;

  const disabled = mode === "view";

  const handleSubmit = async () => {
    if (mode === "add") {
      await axios.post(`${API_BASE}/job-openings`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (mode === "edit") {
      await axios.put(`${API_BASE}/job-openings/${job._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[460px] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-5">
          {mode === "add" && "Add Job Opening"}
          {mode === "view" && "View Job Opening"}
          {mode === "edit" && "Edit Job Opening"}
        </h2>

        {/* Job Title */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input
            disabled={disabled}
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Department */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Department</label>
          <input
            disabled={disabled}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            disabled={disabled}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Openings */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Openings</label>
          <input
            type="number"
            disabled={disabled}
            value={form.openings}
            onChange={(e) =>
              setForm({ ...form, openings: Number(e.target.value) })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            disabled={disabled}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">
            Close
          </button>

          {mode !== "view" && (
            <button
              onClick={handleSubmit}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              {mode === "add" ? "Save" : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEditJobModal;
