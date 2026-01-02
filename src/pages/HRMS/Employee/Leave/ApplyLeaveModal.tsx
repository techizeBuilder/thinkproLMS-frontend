/** @format */
import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface LeaveType {
  _id: string;
  name: string;
  maxDays: number;
}

const ApplyLeaveModal = ({ open, onClose, data, onSuccess }: any) => {
  const token = localStorage.getItem("token");

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [userLeaves, setUserLeaves] = useState<any[]>([]);
  const [remainingLeaves, setRemainingLeaves] = useState(0);
  const [requestedDays, setRequestedDays] = useState(0);

  const formatDateForInput = (date: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    leaveType: data?.leaveType || "",
    fromDate: data?.fromDate ? formatDateForInput(data.fromDate) : "",
    toDate: data?.toDate ? formatDateForInput(data.toDate) : "",
    reason: data?.reason || "",
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (open) {
      fetchLeaveTypes();
      fetchUserLeaves();
    }
  }, [open]);

  const fetchLeaveTypes = async () => {
    const res = await axios.get(`${API_BASE}/leave-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaveTypes(res.data || []);
  };

  const fetchUserLeaves = async () => {
    const res = await axios.get(`${API_BASE}/employee/leaves`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserLeaves(res.data || []);
  };

  /* ================= CALCULATIONS ================= */

  // calculate remaining leaves
  useEffect(() => {
    if (!form.leaveType) {
      setRemainingLeaves(0);
      return;
    }

    const selectedType = leaveTypes.find((lt) => lt.name === form.leaveType);
    if (!selectedType) return;

    const used = userLeaves
      .filter((l) => l.leaveType === form.leaveType && l.status === "APPROVED")
      .reduce((sum, l) => sum + (l.totalDays || 0), 0);

    const remaining = selectedType.maxDays - used;
    setRemainingLeaves(remaining < 0 ? 0 : remaining);
  }, [form.leaveType, leaveTypes, userLeaves]);

  // calculate requested days
  useEffect(() => {
    if (!form.fromDate || !form.toDate) {
      setRequestedDays(0);
      return;
    }

    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);

    const diff =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    setRequestedDays(diff > 0 ? diff : 0);
  }, [form.fromDate, form.toDate]);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (data) {
      await axios.put(`${API_BASE}/employee/leaves/${data._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(
        `${API_BASE}/employee/leaves`,
        {
          ...form,
          status: "PENDING",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    onSuccess();
    onClose();
  };

  if (!open) return null;

  const isInvalid = requestedDays === 0 || requestedDays > remainingLeaves;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-5">
          {data ? "View / Edit Leave Request" : "Apply Leave"}
        </h3>

        <div className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map((lt) => (
                <option key={lt._id} value={lt.name}>
                  {lt.name} ({lt.maxDays} days)
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              className="w-full border rounded-md p-2 text-sm"
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              className="w-full border rounded-md p-2 text-sm"
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
          </div>

          {/* Remaining */}
          <div className="flex justify-between text-sm">
            <span>
              Remaining: <strong>{remainingLeaves}</strong> day(s)
            </span>
            <span>
              Requested: <strong>{requestedDays}</strong> day(s)
            </span>
          </div>

          {isInvalid && form.leaveType && (
            <p className="text-xs text-red-600">
              Requested leave exceeds remaining balance
            </p>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md"
          >
            Cancel
          </button>

          <button
            disabled={isInvalid}
            onClick={submit}
            className={`px-4 py-2 rounded-md text-sm text-white ${
              isInvalid ? "bg-gray-400 cursor-not-allowed" : "bg-primary"
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
