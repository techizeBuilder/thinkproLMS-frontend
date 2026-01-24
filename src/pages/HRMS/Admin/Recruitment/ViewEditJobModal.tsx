/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "../../Alert/Toast";
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

  const [errors, setErrors] = useState({
    jobTitle: "",
    department: "",
    location: "",
  });

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setForm({
      jobTitle: "",
      department: "",
      location: "",
      openings: 1,
      status: "Open",
    });

    setErrors({
      jobTitle: "",
      department: "",
      location: "",
    });
  };

  /* ================= SAFE CLOSE ================= */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /* ================= PREFILL ================= */
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

    if (mode === "add" && isOpen) {
      resetForm();
    }
  }, [job, mode, isOpen]);

  if (!isOpen) return null;

  const disabled = mode === "view";

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
  const handleSubmit = async () => {
    if (!validate()) return;

    if (mode === "add") {
      const res=await axios.post(`${API_BASE}/job-openings`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
       toast({
              type: "success",
              title: "Job Added",
              message: res.data?.message || "Job Added successfully.",
            });
    }
    

    if (mode === "edit") {
      const res=await axios.put(`${API_BASE}/job-openings/${job._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
       toast({
              type: "success",
              title: "Job Updated",
              message: res.data?.message || "Salary structure updated successfully.",
            });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* MODAL */}
      <div
        className="relative z-10 bg-white w-[460px] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-5">
          {mode === "add" && "Add Job Opening"}
          {mode === "view" && "View Job Opening"}
          {mode === "edit" && "Edit Job Opening"}
        </h2>

        {/* Job Title */}
        <div className="mb-3">
          <label className="block text-sm font-medium">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            disabled={disabled}
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.jobTitle ? "border-red-500" : ""
            }`}
          />
          {errors.jobTitle && (
            <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>
          )}
        </div>

        {/* Department */}
        <div className="mb-3">
          <label className="block text-sm font-medium">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            disabled={disabled}
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.department ? "border-red-500" : ""
            }`}
          />
          {errors.department && (
            <p className="text-xs text-red-500 mt-1">{errors.department}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-3">
          <label className="block text-sm font-medium">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            disabled={disabled}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className={`w-full border px-3 py-2 rounded mt-1 text-sm ${
              errors.location ? "border-red-500" : ""
            }`}
          />
          {errors.location && (
            <p className="text-xs text-red-500 mt-1">{errors.location}</p>
          )}
        </div>

        {/* Openings */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Openings</label>
          <input
            type="number"
            disabled={disabled}
            value={form.openings}
            onChange={(e) =>
              setForm({
                ...form,
                openings: Number(e.target.value),
              })
            }
            className="w-full border px-3 py-2 rounded mt-1 text-sm"
          />
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="block text-sm font-medium">Status</label>
          <select
            disabled={disabled}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border px-3 py-2 rounded mt-1 text-sm"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            {mode === "view" ? "Close" : "Cancel"}
          </button>

          {mode !== "view" && (
            <button
              onClick={handleSubmit}
              className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm"
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
