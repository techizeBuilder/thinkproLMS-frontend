/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";

interface User {
  _id: string;
  name: string;
  role: string;
}

type PayrollStatus = "Draft" | "Processed" | "Paid";

interface PayrollRow {
  userId: string;
  name: string;
  gross: number;
  deduction: number;
  net: number;
  status: PayrollStatus;
}

const API_BASE = import.meta.env.VITE_API_URL;

const PayrollRun = () => {
  /* ================= STATE ================= */
  const [users, setUsers] = useState<User[]>([]);
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isPayrollRun, setIsPayrollRun] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= CURRENT MONTH ================= */
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  /* ================= FETCH EMPLOYEES ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= GENERATE PAYROLL (DRAFT) ================= */
  useEffect(() => {
    if (users.length === 0) return;

    const data: PayrollRow[] = users.map((u) => {
      const gross = 30000;
      const deduction = 5000;
      const net = gross - deduction;

      return {
        userId: u._id,
        name: u.name,
        gross,
        deduction,
        net,
        status: "Draft",
      };
    });

    setPayroll(data);
    setIsPayrollRun(false); // month change par reset
  }, [users, month]);

  /* ================= RUN PAYROLL ================= */
  const runPayroll = () => {
    if (isPayrollRun) return;

   const updated: PayrollRow[] = payroll.map((p) => ({
     ...p,
     status: "Processed" as PayrollStatus,
   }));

   setPayroll(updated);
    setIsPayrollRun(true);

    alert(`Payroll successfully run for ${month}`);
  };

  /* ================= UPDATE STATUS (Paid etc) ================= */
  const updateStatus = (userId: string, status: PayrollStatus) => {
    setPayroll((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, status } : p))
    );
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payroll Run</h1>
          <p className="text-sm text-gray-500">Dashboard / Payroll / Run</p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          <button
            onClick={runPayroll}
            disabled={isPayrollRun}
            className={`px-4 py-2 rounded-md text-white ${
              isPayrollRun
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPayrollRun ? "Payroll Processed" : "Run Payroll"}
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Gross</th>
              <th className="px-4 py-3">Deduction</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {payroll.map((row, index) => (
              <tr key={row.userId} className="border-t text-sm">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">₹{row.gross}</td>
                <td className="px-4 py-3 text-red-500">₹{row.deduction}</td>
                <td className="px-4 py-3 font-semibold text-green-600">
                  ₹{row.net}
                </td>

                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      updateStatus(row.userId, e.target.value as PayrollStatus)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Processed">Processed</option>
                    <option value="Paid">Paid</option>
                  </select>
                </td>

                <td className="px-4 py-3 text-center relative">
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenMenu(openMenu === row.userId ? null : row.userId)
                    }
                  >
                    <MoreVertical size={18} />
                  </span>

                  {openMenu === row.userId && (
                    <div className="absolute right-6 mt-2 w-36 bg-white border rounded-md shadow">
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        View Details
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                        Generate Payslip
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {payroll.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No payroll data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollRun;
