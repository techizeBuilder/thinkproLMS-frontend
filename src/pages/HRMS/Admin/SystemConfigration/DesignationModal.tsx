/** @format */

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

export default function DesignationModal({
  isOpen,
  mode,
  designation,
  onClose,
}: any) {
  const token = localStorage.getItem("token");
  const disabled = mode === "view";

  const [companies, setCompanies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [form, setForm] = useState({
    companyId: "",
    departmentId: "",
    name: "",
    status: "Active",
  });

  useEffect(() => {
    axios
      .get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setCompanies(r.data));
  }, []);

  useEffect(() => {
    if (form.companyId) {
      axios
        .get(`${API_BASE}/departments?companyId=${form.companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => setDepartments(r.data));
    }
  }, [form.companyId]);

  useEffect(() => {
    if (designation) {
      setForm({
        companyId: designation.companyId._id,
        departmentId: designation.departmentId._id,
        name: designation.name,
        status: designation.status,
      });
    }
  }, [designation]);

  const save = async () => {
    if (mode === "add") {
      await axios.post(`${API_BASE}/designations`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (mode === "edit") {
      await axios.put(`${API_BASE}/designations/${designation._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-full max-w-lg">
        <h2 className="font-semibold mb-4 capitalize">{mode} Designation</h2>

        <div className="grid gap-4 text-sm">
          <select
            disabled={disabled}
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            disabled={disabled}
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            disabled={disabled}
            placeholder="Designation Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border px-3 py-2 rounded"
          />

          <select
            disabled={disabled}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border px-3 py-2 rounded"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Close
          </button>
          {mode !== "view" && (
            <button
              onClick={save}
              className="bg-orange-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
