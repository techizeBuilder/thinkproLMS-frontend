/** @format */

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export interface Company {
  _id: string;
  name: string;
}

export interface Branch {
  _id: string;
  companyId: string;
  companyName?: string;
  name: string;
  code?: string;
  city: string;
  state: string;
  country: string;
  address?: string;
  pincode?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

interface Props {
  isOpen: boolean;
  mode: "add" | "view" | "edit";
  branch: Branch | null;
  onClose: () => void;
}

export default function BranchModal({ isOpen, mode, branch, onClose }: Props) {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState<Company[]>([]);

  const [form, setForm] = useState({
    companyId: "",
    name: "",
    code: "",
    city: "",
    state: "",
    country: "India",
    address: "",
    pincode: "",
    status: "Active",
  });

  /* ================= FETCH COMPANIES ================= */
  const fetchCompanies = async () => {
    const res = await axios.get(`${API_BASE}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (branch) {
      setForm({
        companyId: branch.companyId,
        name: branch.name,
        code: branch.code || "",
        city: branch.city,
        state: branch.state,
        country: branch.country,
        address: branch.address || "",
        pincode: branch.pincode || "",
        status: branch.status,
      });
    } else {
      setForm({
        companyId: "",
        name: "",
        code: "",
        city: "",
        state: "",
        country: "India",
        address: "",
        pincode: "",
        status: "Active",
      });
    }
  }, [branch]);

  const handleSubmit = async () => {
    if (mode === "view") return;

    if (!form.companyId) {
      alert("Please select company");
      return;
    }

    if (mode === "add") {
      await axios.post(`${API_BASE}/branches`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (mode === "edit" && branch) {
      await axios.put(`${API_BASE}/branches/${branch._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const disabled = mode === "view";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-xl rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 capitalize">{mode} Branch</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* COMPANY DROPDOWN */}
          <div className="col-span-2">
            <label className="block mb-1 font-medium">
              Company <span className="text-red-500">*</span>
            </label>
            <select
              disabled={disabled}
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {[
            ["Branch Name", "name"],
            ["Branch Code", "code"],
            ["City", "city"],
            ["State", "state"],
            ["Country", "country"],
            ["Pincode", "pincode"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block mb-1 font-medium">{label}</label>
              <input
                disabled={disabled}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              disabled={disabled}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              disabled={disabled}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
