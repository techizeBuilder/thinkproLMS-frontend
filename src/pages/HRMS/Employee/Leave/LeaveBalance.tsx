/** @format */
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

interface LeaveType {
  _id: string;
  name: string;
  maxDays: number;
}

interface Leave {
  _id: string;
  leaveType: string;
  totalDays: number;
  status: string;
  fromDate: string;
  toDate: string;
}

const LeaveBalance = () => {
  const token = localStorage.getItem("token");

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchLeaveTypes();
    fetchLeaves();
  }, []);

  const fetchLeaveTypes = async () => {
    const res = await axios.get(`${API_BASE}/leave-types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaveTypes(res.data || []);
  };

  const fetchLeaves = async () => {
    const res = await axios.get(`${API_BASE}/employee/leaves`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLeaves(res.data || []);
  };

  /* ================= HELPERS ================= */

  const getUsedLeaves = (type: string) =>
    leaves
      .filter((l) => l.leaveType === type && l.status === "APPROVED")
      .reduce((sum, l) => sum + (l.totalDays || 0), 0);

  const recentLeaves = leaves
    .filter((l) => l.status !== "REJECTED")
    .slice(0, 5);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  /* ================= UI ================= */

  return (
    <div className="p-5 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Leave Balance</h2>
        <p className="text-sm text-gray-500">HRMS / Leave / Balance</p>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {leaveTypes.map((lt) => {
          const used = getUsedLeaves(lt.name);
          const remaining = lt.maxDays - used;

          return (
            <div
              key={lt._id}
              className="bg-white rounded-xl shadow p-4 border relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-10 -mt-10" />

              <h4 className="text-sm font-semibold text-gray-500">{lt.name}</h4>

              <div className="mt-3 flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-primary">{remaining}</p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">{used}</p>
                  <p className="text-xs text-gray-500">Used</p>
                </div>
              </div>

              <div className="mt-3 h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-primary rounded"
                  style={{
                    width: `${(used / lt.maxDays) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Total: {lt.maxDays} days
              </p>
            </div>
          );
        })}
      </div>

      {/* ================= RECENT SUMMARY ================= */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Recent Leave Summary</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 ">Type</th>
                <th className="p-3">From</th>
                <th className="p-3">To</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.map((l) => (
                <tr key={l._id} className="border-t">
                  <td className="p-3">{l.leaveType}</td>
                  <td className="p-3">{formatDate(l.fromDate)}</td>
                  <td className="p-3">{formatDate(l.toDate)}</td>
                  <td className="p-3">{l.totalDays}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          l.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}

              {recentLeaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
