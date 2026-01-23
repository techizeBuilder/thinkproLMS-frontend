/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, CheckCircle } from "lucide-react";
import Loader from "../../Loader";

type PayrollStatus = "Draft" | "Processed" | "Paid" | "Rejected";

interface Employee {
  _id: string;
  name: string;
}

interface Payroll {
  _id: string;
  employee: Employee;
  net: number;
  status: PayrollStatus;
}

interface DocumentItem {
  _id: string;
  type: string;
  file: string;
  fileUrl: string;
  mimeType: string;
}


const API_BASE = import.meta.env.VITE_API_URL as string;

const SalaryDisbursement = () => {
  const token = localStorage.getItem("token");

  const [month, setMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [passbook, setPassbook] = useState<DocumentItem | null>(null);

  /* ================= FETCH PAYROLL ================= */
  const fetchPayroll = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await axios.get<Payroll[]>(
        `${API_BASE}/payroll?month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filtered = res.data.filter(
        (p) => p.status === "Processed" || p.status === "Paid"
      );

      setPayrolls(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month]);

  /* ================= VIEW PASSBOOK ================= */
  const viewPassbook = async (userId: string): Promise<void> => {
    try {
      const res = await axios.get<DocumentItem[]>(
        `${API_BASE}/documents/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const bankPassbook = res.data.find((doc) => doc.type === "PASSBOOK");

      if (!bankPassbook) {
        alert("Bank passbook not uploaded");
        return;
      }

      setPassbook(bankPassbook);
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= MARK AS PAID ================= */
  const confirmPaid = async (payrollId: string): Promise<void> => {
    if (!window.confirm("Confirm salary paid?")) return;

    try {
      await axios.patch(
        `${API_BASE}/payroll/${payrollId}/status`,
        { status: "Paid" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchPayroll();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };
  if(loading)return<Loader/>
  /* ================= UI ================= */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Salary Disbursement</h1>
          <p className="text-sm text-gray-500">Finance / Salary Disbursement</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Sr.No</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Month</th>
              <th className="p-3">Net Salary</th>
              <th className="p-3">Passbook</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6">
                  Loading...
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-gray-500">
                  No payroll found
                </td>
              </tr>
            ) : (
              payrolls.map((p, i) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{p.employee.name}</td>
                  <td className="p-3">{month}</td>
                  <td className="p-3 font-semibold text-green-600">₹{p.net}</td>

                  <td className="p-3">
                    <button
                      className="flex gap-2 items-center text-blue-600 hover:underline mx-auto"
                      onClick={() => viewPassbook(p.employee._id)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => confirmPaid(p._id)}
                      disabled={p.status === "Paid"}
                      className={`flex gap-2 items-center px-4 py-2 rounded-md mx-auto transition
      ${
        p.status === "Paid"
          ? "bg-green-200 text-green-700 opacity-60 cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
                    >
                      <CheckCircle size={16} />
                      Confirm Paid
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PASSBOOK MODAL */}
      {passbook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[90vw] h-[90vh] p-6 rounded-xl flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Bank Passbook</h2>

            <div className="flex-1 overflow-auto">
              {passbook.mimeType?.startsWith("image") ? (
                <img
                  src={`http://localhost:8000/${passbook.fileUrl.replace(
                    /\\/g,
                    "/"
                  )}`}
                  alt="Passbook"
                  className="w-full max-h-[75vh] object-contain mx-auto"
                />
              ) : (
                <iframe
                  src={`http://localhost:8000/${passbook.fileUrl.replace(
                    /\\/g,
                    "/"
                  )}`}
                  className="w-full h-[75vh] border rounded"
                />
              )}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setPassbook(null)}
                className="px-5 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryDisbursement;
