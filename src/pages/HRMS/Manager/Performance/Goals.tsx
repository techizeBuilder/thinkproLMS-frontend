/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import AddGoalModal from "./AddGoalModal";

const API_BASE = import.meta.env.VITE_API_URL;

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  deadline?: string;
  assignedTo?: {
    _id: string;
    name: string;
    employeeId: string;
  };
}

export default function Goals() {
  const token = localStorage.getItem("token");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/goals/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(res.data);
    } catch (err) {
      console.error("Failed to fetch goals", err);
    }
  };

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`${API_BASE}/goals/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDelete(false);
      setDeleteId(null);
      fetchGoals();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Goals / OKRs</h2>
        <button
          onClick={() => {
            setEditGoal(null);
            setOpenAdd(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          + Add Goal
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => (
          <div
            key={goal._id}
            className="relative bg-white rounded-lg shadow p-4"
          >
            {/* 3 DOT */}
            <div className="absolute top-3 right-3">
              <span
                className="cursor-pointer text-gray-600"
                onClick={() =>
                  setOpenMenu(openMenu === goal._id ? null : goal._id)
                }
              >
                <MoreVertical size={18} />
              </span>

              {openMenu === goal._id && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setOpenMenu(null);
                      setEditGoal(goal);
                      setOpenAdd(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    onClick={() => {
                      setOpenMenu(null);
                      setDeleteId(goal._id);
                      setOpenDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <h3 className="text-base font-semibold">{goal.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{goal.description}</p>

            <p className="text-sm mt-2">
              <strong>Assigned:</strong> {goal.assignedTo?.name || "—"}
            </p>

            <p className="text-sm">
              <strong>Status:</strong>{" "}
              <span className="text-blue-600">{goal.status}</span>
            </p>

            {/* Deadline */}
            {goal.deadline && (
              <p className="text-sm mt-1">
                <strong>Deadline:</strong>{" "}
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}

            {/* Progress */}
            <div className="mt-3">
              <p className="text-sm mb-1">Progress: {goal.progress}%</p>
              <div className="w-full h-2 rounded border border-gray-300 bg-gray-100">
                <div
                  className="h-2 rounded bg-green-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      <AddGoalModal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setEditGoal(null);
        }}
        onSuccess={fetchGoals}
        editGoal={editGoal} // 👈 prefill ke liye
      />

      {/* DELETE MODAL */}
      {openDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-3">Delete Goal?</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this goal?
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setOpenDelete(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
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
