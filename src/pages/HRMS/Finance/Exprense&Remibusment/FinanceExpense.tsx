/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];

export default function FinanceExpenseRequest() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [loading,setLoading]=useState(true);

  const token = localStorage.getItem("token");

  const fetchExpenses = async () => {
    const res = await axios.get(`${API_BASE}/expenses/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await axios.put(
      `${API_BASE}/expenses/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchExpenses();
  };

  const statusClasses = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };
 if(loading)return<Loader/>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Expense Requests</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Employee</th>
              <th className="p-2">Type</th>
              <th className="p-2">Category</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="border-t">
                {/* Employee */}
                <td className="p-2">
                  {exp.employee?.name}
                  <div className="text-xs text-gray-500">
                    {exp.employee?.email}
                  </div>
                </td>

                <td className="p-2">{exp.expenseType}</td>
                <td className="p-2">{exp.category}</td>
                <td className="p-2 font-medium">₹{exp.amount}</td>
                <td className="p-2">
                  {new Date(exp.date).toLocaleDateString()}
                </td>

                {/* STATUS DROPDOWN */}
                <td className="p-2">
                  <select
                    value={exp.status}
                    onChange={(e) => updateStatus(exp._id, e.target.value)}
                    className={`px-2 py-1 rounded border text-xs font-semibold outline-none cursor-pointer ${statusClasses(
                      exp.status
                    )}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                {/* ACTION */}
                <td className="p-2">
                  <button
                    onClick={() => setSelectedExpense(exp)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {expenses.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No expense requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Expense Details</h3>

            <div className="space-y-2 text-sm">
              <p>
                <b>Employee:</b> {selectedExpense.employee?.name}
              </p>
              <p>
                <b>Expense Type:</b> {selectedExpense.expenseType}
              </p>
              <p>
                <b>Category:</b> {selectedExpense.category}
              </p>
              <p>
                <b>Amount:</b> ₹{selectedExpense.amount}
              </p>
              <p>
                <b>Date:</b>{" "}
                {new Date(selectedExpense.date).toLocaleDateString()}
              </p>
              <p>
                <b>Remarks:</b> {selectedExpense.remarks || "-"}
              </p>

              {selectedExpense.receipt && (
                <a
                  href={`http://localhost:8000${selectedExpense.receipt}`}
                  target="_blank"
                  className="inline-block text-blue-600 underline mt-2"
                >
                  View Receipt
                </a>
              )}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedExpense(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
