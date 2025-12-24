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

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        email: company.email,
        phone: company.phone,
        website: company.website,
        industry: company.industry,
        address: company.address,
        status: company.status,
      });
    }
  }, [company]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
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

  const isView = mode === "view";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === "add"
              ? "Add Company"
              : mode === "edit"
              ? "Edit Company"
              : "View Company"}
          </h2>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            ["Company Name", "name"],
            ["Email", "email"],
            ["Phone", "phone"],
            ["Website", "website"],
            ["Industry", "industry"],
          ].map(([label, key]) => (
            <div key={key} className="col-span-1">
              <label className="text-sm font-medium">{label}</label>
              <input
                disabled={isView}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="text-sm font-medium">Address</label>
            <textarea
              disabled={isView}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full border rounded px-3 py-2"
            />
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

        <div className="px-6 py-4 border-t flex justify-end gap-2">
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
