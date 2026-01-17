/** @format */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface LeaveItem {
  _id: string;
  employee: Employee;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

const getCurrentMonth = () => {
  const d = new Date();
  return d.toISOString().slice(0, 7); // YYYY-MM
};

export default function AuditorLeave() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  /* ================= FETCH ALL LEAVES ================= */
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/employee/leaves/all`, { headers });
        setLeaves(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  /* ================= MONTH FILTER (FRONTEND) ================= */
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const fromMonth = l.fromDate.slice(0, 7);
      const toMonth = l.toDate.slice(0, 7);

      const matchMonth = fromMonth === month || toMonth === month;

      const matchSearch = l.employee.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchMonth && matchSearch;
    });
  }, [leaves, month, search]);

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    const totalEmployees = new Set(filteredLeaves.map((l) => l.employee._id))
      .size;

    const totalLeaves = filteredLeaves.length;
    const approved = filteredLeaves.filter(
      (l) => l.status === "APPROVED"
    ).length;
    const pending = filteredLeaves.filter((l) => l.status === "PENDING").length;
    const rejected = filteredLeaves.filter(
      (l) => l.status === "REJECTED"
    ).length;

    return {
      totalEmployees,
      totalLeaves,
      approved,
      pending,
      rejected,
    };
  }, [filteredLeaves]);

  if (loading) {
    return <p className="p-6">Loading leave records...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Leave Records ({month})
        </h2>

        <div className="flex gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm w-52"
          />
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Employees"
          value={summary.totalEmployees}
          color="bg-purple-100 text-purple-700"
        />
        <SummaryCard
          title="Total Leaves"
          value={summary.totalLeaves}
          color="bg-blue-100 text-blue-700"
        />
        <SummaryCard
          title="Approved"
          value={summary.approved}
          color="bg-green-100 text-green-700"
        />
        <SummaryCard
          title="Pending"
          value={summary.pending}
          color="bg-yellow-100 text-yellow-700"
        />
        <SummaryCard
          title="Rejected"
          value={summary.rejected}
          color="bg-red-100 text-red-700"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3">Role</th>
              <th className="p-3">Leave Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Days</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.map((l) => (
              <tr key={l._id} className="border-t text-center">
                <td className="p-3 text-left font-medium">{l.employee.name}</td>
                <td className="p-3">{l.employee.role}</td>
                <td className="p-3">{l.leaveType}</td>
                <td className="p-3">{l.fromDate.slice(0, 10)}</td>
                <td className="p-3">{l.toDate.slice(0, 10)}</td>
                <td className="p-3 font-semibold">{l.totalDays}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      l.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : l.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredLeaves.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No leave records found for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SUMMARY CARD ================= */
function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
