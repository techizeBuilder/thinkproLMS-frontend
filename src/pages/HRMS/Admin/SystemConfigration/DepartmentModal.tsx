/** @format */

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

interface Props {
  isOpen: boolean;
  mode: "add" | "view" | "edit";
  department: any;
  onClose: () => void;
}

export default function DepartmentModal({
  isOpen,
  mode,
  department,
  onClose,
}: Props) {
  const token = localStorage.getItem("token");
  const disabled = mode === "view";

  const [companies, setCompanies] = useState<any[]>([]);
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [form, setForm] = useState({
    companyId: "",
    branchId: "",
    name: "",
    headEmployeeId: "",
    status: "Active",
  });

  /* =========================
     INITIAL API CALLS
  ==========================*/
  useEffect(() => {
    // Companies
    axios
      .get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setCompanies(r.data));

    // Branches (simple call – no filter)
    axios
      .get(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setAllBranches(r.data));

    // Users → only managers
    axios
      .get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => {
        const onlyManagers = r.data.filter(
          (user: any) => user.role === "manager"
        );
        setManagers(onlyManagers);
      });
  }, []);

  /* =========================
     FILTER BRANCHES ON COMPANY CHANGE
  ==========================*/
  useEffect(() => {
    if (!form.companyId) {
      setBranches([]);
      setForm((prev) => ({ ...prev, branchId: "" }));
      return;
    }

    const filtered = allBranches.filter(
      (b) =>
        b.companyId === form.companyId || b.companyId?._id === form.companyId
    );

    setBranches(filtered);
  }, [form.companyId, allBranches]);

  /* =========================
     EDIT MODE DATA SET
  ==========================*/
  useEffect(() => {
    if (department) {
      setForm({
        companyId: department.companyId?._id || department.companyId,
        branchId: department.branchId?._id || department.branchId,
        name: department.name,
        headEmployeeId: department.headEmployeeId?._id || "",
        status: department.status,
      });
    }
  }, [department]);

  /* =========================
     SAVE
  ==========================*/
  const save = async () => {
    if (mode === "add") {
      await axios.post(`${API_BASE}/departments`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (mode === "edit") {
      await axios.put(`${API_BASE}/departments/${department._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4 capitalize">
          {mode} Department
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Company */}
          <div>
            <label className="block mb-1">Company</label>
            <select
              disabled={disabled}
              value={form.companyId}
              onChange={(e) =>
                setForm({
                  ...form,
                  companyId: e.target.value,
                  branchId: "",
                })
              }
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block mb-1">Branch</label>
            <select
              disabled={disabled || !form.companyId}
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Name */}
          <div className="col-span-2">
            <label className="block mb-1">Department Name</label>
            <input
              disabled={disabled}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Department Head */}
          <div className="col-span-2">
            <label className="block mb-1">Department Head</label>
            <select
              disabled={disabled}
              value={form.headEmployeeId}
              onChange={(e) =>
                setForm({ ...form, headEmployeeId: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1">Status</label>
            <select
              disabled={disabled}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
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
