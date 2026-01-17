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

  const [errors, setErrors] = useState({
    jobTitle: "",
    department: "",
    location: "",
  });

  if (!isOpen) return null;

  /* ================= VALIDATION ================= */
  const validate = () => {
    let valid = true;
    const newErrors = {
      jobTitle: "",
      department: "",
      location: "",
    };

    if (!form.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
      valid = false;
    }

    if (!form.department.trim()) {
      newErrors.department = "Department is required";
      valid = false;
    }

    if (!form.location.trim()) {
      newErrors.location = "Location is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validate()) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div
        className="relative z-10 bg-white w-[420px] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Add Job Opening</h2>

        {/* JOB TITLE */}
        <div className="mb-3">
          <label className="text-sm font-medium">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.jobTitle ? "border-red-500" : ""
            }`}
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
          {errors.jobTitle && (
            <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>
          )}
        </div>

        {/* DEPARTMENT */}
        <div className="mb-3">
          <label className="text-sm font-medium">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.department ? "border-red-500" : ""
            }`}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />
          {errors.department && (
            <p className="text-xs text-red-500 mt-1">{errors.department}</p>
          )}
        </div>

        {/* LOCATION */}
        <div className="mb-4">
          <label className="text-sm font-medium">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.location ? "border-red-500" : ""
            }`}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          {errors.location && (
            <p className="text-xs text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddJobOpeningModal;
