/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import Loader from "../../Loader";
import { toast } from "../../Alert/Toast";

const API_BASE = import.meta.env.VITE_API_URL as string;
const ViewAPI = API_BASE.replace("/api", "");

/* ================= TYPES ================= */

type StatusType = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
}

interface Expense {
  _id: string;
  employee: Employee;
  expenseType: "TRAVEL" | "OTHER";
  category: string;
  amount: number;
  date: string;
  remarks?: string;
  receipt?: string;
  status: StatusType;
  createdAt: string;
}

interface TravelRequest {
  _id: string;
  employee: Employee;
  purpose: string;
  destination: string;
  fromDate: string;
  toDate: string;
  budget: number;
  remarks?: string;
  status: StatusType;
  createdAt: string;
}

/* ================= HELPERS ================= */

const statusColor = (status: StatusType) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "PAID":
      return "bg-blue-100 text-blue-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "";
  }
};

/* ================= COMPONENT ================= */

const FinanceReimbursementRequests = () => {
  const token = localStorage.getItem("token");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travels, setTravels] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "TRAVEL">("EXPENSE");
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);
  const [viewTravel, setViewTravel] = useState<TravelRequest | null>(null);

  /* ================= FETCH ================= */

  const fetchExpenses = async () => {
    const res = await axios.get(`${API_BASE}/expenses/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
  };

  const fetchTravels = async () => {
    const res = await axios.get(`${API_BASE}/travel-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTravels(res.data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchExpenses(), fetchTravels()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= STATUS UPDATE ================= */

  const updateExpenseStatus = async (id: string, status: StatusType) => {
    try {
      await axios.put(
        `${API_BASE}/expenses/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({ type: "success", title: "Expense Updated" });
      fetchExpenses();
    } catch (e: any) {
      toast({ type: "error", title: "Update Failed" });
    }
  };

  const updateTravelStatus = async (id: string, status: StatusType) => {
    try {
      await axios.patch(
        `${API_BASE}/travel-requests/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast({ type: "success", title: "Travel Updated" });
      fetchTravels();
    } catch (e: any) {
      toast({ type: "error", title: "Update Failed" });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Finance Reimbursement
        </h1>
        <p className="text-sm text-gray-500">
          Manage Expense & Travel reimbursement requests
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`pb-2 font-medium ${
            activeTab === "EXPENSE"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Expense Requests
        </button>

        <button
          onClick={() => setActiveTab("TRAVEL")}
          className={`pb-2 font-medium ${
            activeTab === "TRAVEL"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Travel Requests
        </button>
      </div>

      {/* ================= EXPENSE TABLE ================= */}
      {activeTab === "EXPENSE" && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Sr.No</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr key={e._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{e.employee.name}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3">₹{e.amount}</td>
                  <td className="p-3">
                    {new Date(e.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <select
                      value={e.status}
                      disabled={e.status === "REJECTED"}
                      onChange={(ev) =>
                        updateExpenseStatus(
                          e._id,
                          ev.target.value as StatusType,
                        )
                      }
                      className={`px-2 py-1 rounded text-sm ${statusColor(
                        e.status,
                      )}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Paid</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewExpense(e)}
                      className="text-blue-600 flex gap-1 items-center mx-auto"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TRAVEL TABLE ================= */}
      {activeTab === "TRAVEL" && (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {travels.map((t, i) => (
                <tr key={t._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{t.employee.name}</td>
                  <td className="p-3">{t.destination}</td>
                  <td className="p-3">
                    {new Date(t.fromDate).toLocaleDateString()} -{" "}
                    {new Date(t.toDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">₹{t.budget}</td>
                  <td className="p-3">
                    <select
                      value={t.status}
                      disabled={t.status === "REJECTED"}
                      onChange={(ev) =>
                        updateTravelStatus(t._id, ev.target.value as StatusType)
                      }
                      className={`px-2 py-1 rounded text-sm ${statusColor(
                        t.status,
                      )}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PAID">Paid</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewTravel(t)}
                      className="text-blue-600 flex gap-1 items-center mx-auto"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODALS (same as before) ================= */}
      {viewExpense && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setViewExpense(null)}
        >
          <div
            className="bg-white w-[600px] p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Expense Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>Employee:</b> {viewExpense.employee.name}
              </p>
              <p>
                <b>Employee ID:</b> {viewExpense.employee.employeeId}
              </p>
              <p>
                <b>Type:</b> {viewExpense.expenseType}
              </p>
              <p>
                <b>Category:</b> {viewExpense.category}
              </p>
              <p>
                <b>Amount:</b> ₹{viewExpense.amount}
              </p>
              <p>
                <b>Date:</b> {new Date(viewExpense.date).toLocaleDateString()}
              </p>
              <p>
                <b>Status:</b> {viewExpense.status}
              </p>

              {viewExpense.remarks && (
                <p>
                  <b>Remarks:</b> {viewExpense.remarks}
                </p>
              )}

              {viewExpense.receipt && (
                <a
                  href={`${ViewAPI}${viewExpense.receipt}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Receipt
                </a>
              )}
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setViewExpense(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {viewTravel && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setViewTravel(null)}
        >
          <div
            className="bg-white w-[600px] p-6 rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              Travel Request Details
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <b>Employee:</b> {viewTravel.employee.name}
              </p>
              <p>
                <b>Employee ID:</b> {viewTravel.employee.employeeId}
              </p>
              <p>
                <b>Purpose:</b> {viewTravel.purpose}
              </p>
              <p>
                <b>Destination:</b> {viewTravel.destination}
              </p>

              <p>
                <b>Travel Dates:</b>{" "}
                {new Date(viewTravel.fromDate).toLocaleDateString()} →{" "}
                {new Date(viewTravel.toDate).toLocaleDateString()}
              </p>

              <p>
                <b>Budget:</b> ₹{viewTravel.budget}
              </p>

              {viewTravel.remarks && (
                <p>
                  <b>Remarks:</b> {viewTravel.remarks}
                </p>
              )}

              <p>
                <b>Status:</b> {viewTravel.status}
              </p>
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setViewTravel(null)}
                className="px-4 py-2 border rounded"
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

export default FinanceReimbursementRequests;
