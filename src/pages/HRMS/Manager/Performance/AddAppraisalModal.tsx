/** @format */
import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const AddAppraisalModal = ({ open, onClose, data, onSuccess }: any) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    type: "MID_YEAR",
    startDate: "",
    endDate: "",
    applicableFor: "All Employees",
    status: "DRAFT",
  });

  /* ================= PREFILL ================= */
  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        type: data.type,
        startDate: data.startDate.split("T")[0],
        endDate: data.endDate.split("T")[0],
        applicableFor: data.applicableFor,
        status: data.status,
      });
    }
  }, [data]);

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (data) {
      await axios.put(`${API_BASE}/appraisals/${data._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${API_BASE}/appraisals`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    onSuccess();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          {data ? "Edit Appraisal" : "Create Appraisal"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full border rounded-md p-2 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="MID_YEAR">Mid-Year</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-md p-2 text-sm"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full border rounded-md p-2 text-sm"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Applicable For</label>
            <input
              className="w-full border rounded-md p-2 text-sm"
              value={form.applicableFor}
              onChange={(e) =>
                setForm({ ...form, applicableFor: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAppraisalModal;
