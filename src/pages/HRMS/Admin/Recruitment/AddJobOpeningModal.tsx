/** @format */

import axios from "axios";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const AddJobOpeningModal = ({ isOpen, onClose }: any) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    jobTitle: "",
    department: "",
    location: "",
  });

  if (!isOpen) return null;

  const submit = async () => {
    await axios.post(
      `${API_BASE}/job-openings`,
      {
        ...form,
        openings: 1, // backend required field
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[420px] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add Job Opening</h2>

        <input
          placeholder="Job Title"
          className="w-full border px-3 py-2 rounded mb-3"
          value={form.jobTitle}
          onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
        />

        <input
          placeholder="Department"
          className="w-full border px-3 py-2 rounded mb-3"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />

        <input
          placeholder="Location"
          className="w-full border px-3 py-2 rounded mb-4"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddJobOpeningModal;
