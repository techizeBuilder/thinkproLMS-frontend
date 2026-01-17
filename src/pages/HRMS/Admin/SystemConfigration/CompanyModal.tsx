/** @format */

import axios from "axios";
import { useEffect, useState } from "react";
import type { Company } from "./Company";

const API_BASE = import.meta.env.VITE_API_URL;

interface Props {
  isOpen: boolean;
  mode: "add" | "view" | "edit";
  company: Company | null;
  onClose: () => void;
}

export default function CompanyModal({
  isOpen,
  mode,
  company,
  onClose,
}: Props) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ================= RESET / FILL FORM ================= */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "add") {
      setForm({
        name: "",
        email: "",
        phone: "",
        website: "",
        industry: "",
        address: "",
        status: "Active",
      });
      setErrors({});
    }

    if ((mode === "edit" || mode === "view") && company) {
      setForm({
        name: company.name,
        email: company.email,
        phone: company.phone,
        website: company.website,
        industry: company.industry,
        address: company.address,
        status: company.status,
      });
      setErrors({});
    }
  }, [isOpen, mode, company]);

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email";

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!form.website.trim()) newErrors.website = "Website is required";

    if (!form.industry.trim()) newErrors.industry = "Industry is required";

    if (!form.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (mode === "add") {
      await axios.post(`${API_BASE}/companies`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (mode === "edit" && company) {
      await axios.put(`${API_BASE}/companies/${company._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const isView = mode === "view";

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-lg shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">
            {mode === "add"
              ? "Add Company"
              : mode === "edit"
              ? "Edit Company"
              : "View Company"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto">
          {[
            ["Company Name", "name"],
            ["Email", "email"],
            ["Phone", "phone"],
            ["Website", "website"],
            ["Industry", "industry"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="text-sm font-medium">
                {label} <span className="text-red-500">*</span>
              </label>
              <input
                disabled={isView}
                value={(form as any)[key]}
                onChange={(e) => {
                  setForm({ ...form, [key]: e.target.value });
                  setErrors({ ...errors, [key]: "" });
                }}
                className={`mt-1 w-full border rounded px-3 py-2 ${
                  errors[key] ? "border-red-500" : ""
                }`}
              />
              {errors[key] && (
                <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
              )}
            </div>
          ))}

          <div className="col-span-2">
            <label className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              disabled={isView}
              value={form.address}
              onChange={(e) => {
                setForm({ ...form, address: e.target.value });
                setErrors({ ...errors, address: "" });
              }}
              className={`mt-1 w-full border rounded px-3 py-2 ${
                errors.address ? "border-red-500" : ""
              }`}
              rows={3}
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">Status</label>
            <select
              disabled={isView}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Close
          </button>

          {mode !== "view" && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
