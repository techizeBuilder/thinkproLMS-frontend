/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import AddAppraisalModal from "./AddAppraisalModal";

const API_BASE = import.meta.env.VITE_API_URL;

type Appraisal = {
  _id: string;
  title: string;
  type: "MID_YEAR" | "ANNUAL";
  startDate: string;
  endDate: string;
  applicableFor: string;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  progress: number;
};

export default function Appraisals() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState<Appraisal[]>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Appraisal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchAppraisals = async () => {
    const res = await axios.get(`${API_BASE}/appraisals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(res.data || []);
  };

  useEffect(() => {
    fetchAppraisals();
  }, []);

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteId) return;
    await axios.delete(`${API_BASE}/appraisals/${deleteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteId(null);
    fetchAppraisals();
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Appraisals</h2>
          <p className="text-sm text-gray-500">
            Performance Management / Appraisals
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm"
        >
          + Create Appraisal
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((a) => (
          <div
            key={a._id}
            className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{a.title}</h3>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <b>Type:</b> {a.type === "MID_YEAR" ? "Mid-Year" : "Annual"}
                </p>
                <p>
                  <b>Duration:</b>{" "}
                  {new Date(a.startDate).toLocaleDateString("en-GB")} –{" "}
                  {new Date(a.endDate).toLocaleDateString("en-GB")}
                </p>
                <p>
                  <b>Employees:</b> {a.applicableFor}
                </p>
              </div>

              {/* STATUS */}
              <div className="mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    a.status === "ACTIVE"
                      ? "bg-blue-100 text-blue-700"
                      : a.status === "CLOSED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {a.status}
                </span>
              </div>

              {/* PROGRESS */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{a.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${a.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setEditData(a);
                  setOpen(true);
                }}
                className="px-3 py-1.5 border rounded-md text-sm"
              >
                View / Edit
              </button>

              {a.status !== "CLOSED" && (
                <button
                  onClick={() => setDeleteId(a._id)}
                  className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {open && (
        <AddAppraisalModal
          open={open}
          onClose={() => setOpen(false)}
          data={editData}
          onSuccess={fetchAppraisals}
        />
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-3">Delete Appraisal?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
