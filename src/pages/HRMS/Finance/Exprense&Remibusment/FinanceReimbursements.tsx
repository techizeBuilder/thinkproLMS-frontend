/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL as string;

/* ================= TYPES ================= */

type StatusType = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

interface Employee {
  _id: string;
  name: string;
  email: string;
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

/* ================= COMPONENT ================= */

const FinanceReimbursementRequests = () => {
  const token = localStorage.getItem("token");

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travels, setTravels] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewExpense, setViewExpense] = useState<any>(null);
  const [viewTravel, setViewTravel] = useState<any>(null);


  /* ================= FETCH DATA ================= */

  const fetchExpenses = async () => {
    const res = await axios.get<Expense[]>(`${API_BASE}/expenses/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setExpenses(res.data);
  };

  const fetchTravelRequests = async () => {
    const res = await axios.get<TravelRequest[]>(
      `${API_BASE}/travel-requests`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setTravels(res.data);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchExpenses(), fetchTravelRequests()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= STATUS UPDATE ================= */

  const updateExpenseStatus = async (
    id: string,
    status: StatusType
  ): Promise<void> => {
    await axios.put(
      `${API_BASE}/expenses/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchExpenses();
  };

  const updateTravelStatus = async (
    id: string,
    status: StatusType
  ): Promise<void> => {
    await axios.patch(
      `${API_BASE}/travel-requests/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchTravelRequests();
  };

  /* ================= UI ================= */
 if(loading)return<Loader/>;
  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">
          Finance – Reimbursement Requests
        </h1>
        <p className="text-sm text-gray-500">
          Expense & Travel reimbursement management
        </p>
      </div>

      {/* ================= EXPENSE TABLE ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Expense Requests</h2>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Sr</th>
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
                          ev.target.value as StatusType
                        )
                      }
                      className="border px-2 py-1 rounded"
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
      </section>

      {/* ================= TRAVEL TABLE ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Travel Requests</h2>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Sr</th>
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
                      className="border px-2 py-1 rounded"
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
      </section>

      {/* ================= VIEW MODAL ================= */}
      {viewExpense && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-lg">
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
                  href={`${API_BASE}${viewExpense.receipt}`}
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] p-6 rounded-lg">
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

      {loading && <p className="text-gray-500">Loading...</p>}
    </div>
  );
};

export default FinanceReimbursementRequests;
