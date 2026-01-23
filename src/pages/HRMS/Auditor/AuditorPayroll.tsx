/** @format */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../Loader";

const API = import.meta.env.VITE_API_URL;

interface PayrollItem {
  _id: string;
  month: string;
  gross: number;
  deduction: number;
  net: number;
  status: string;
  employee: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

// 🔥 latest payroll month nikalne ke liye
const getLatestMonth = (data: PayrollItem[]) => {
  if (!data.length) return "";
  return data
    .map((x) => x.month)
    .sort()
    .reverse()[0];
};
const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};


export default function AuditorPayroll() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      // 🔹 pehle saare payroll lao
      const res = await axios.get(`${API}/payroll`, { headers });
      const list: PayrollItem[] = res.data || [];

      // 🔹 latest month nikalo
      const latest = getLatestMonth(list);

      if (latest) {
        setMonth(latest); // 👈 calendar + heading dono yahin set
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // ================= MONTH CHANGE PE FETCH =================
  useEffect(() => {
    if (!month) return;
    fetchPayroll();
  }, [month]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/payroll?month=${month}`, {
        headers,
      });
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔢 SUMMARY CALCULATIONS
  const summary = useMemo(() => {
    const totalEmployees = data.length;
    const totalGross = data.reduce((s, x) => s + x.gross, 0);
    const totalDeduction = data.reduce((s, x) => s + x.deduction, 0);
    const totalNet = data.reduce((s, x) => s + x.net, 0);

    return { totalEmployees, totalGross, totalDeduction, totalNet };
  }, [data]);

  // 🔍 SEARCH FILTER
  const filteredData = useMemo(() => {
    return data.filter((x) =>
      x.employee.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  if (loading)return <Loader/>;

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Payroll Summary ({month})
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Employees"
          value={summary.totalEmployees}
          color="bg-purple-100 text-purple-700"
        />
        <SummaryCard
          title="Gross Payroll"
          value={`₹${summary.totalGross}`}
          color="bg-blue-100 text-blue-700"
        />
        <SummaryCard
          title="Deductions"
          value={`₹${summary.totalDeduction}`}
          color="bg-orange-100 text-orange-700"
        />
        <SummaryCard
          title="Net Pay"
          value={`₹${summary.totalNet}`}
          color="bg-green-100 text-green-700"
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3">Role</th>
              <th className="p-3">Gross</th>
              <th className="p-3">Deduction</th>
              <th className="p-3">Net Pay</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((x) => (
              <tr key={x._id} className="border-t text-center">
                <td className="p-3 text-left font-medium">{x.employee.name}</td>
                <td className="p-3">{x.employee.role}</td>
                <td className="p-3">₹{x.gross}</td>
                <td className="p-3 text-red-600">₹{x.deduction}</td>
                <td className="p-3 font-semibold">₹{x.net}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      x.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {x.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No payroll data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
