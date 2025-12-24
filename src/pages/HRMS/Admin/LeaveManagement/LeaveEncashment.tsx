/** @format */

import { useState } from "react";

interface LeaveEncashment {
  id: string;
  employeeName: string;
  leaveType: string;
  availableBalance: number;
  requestedDays: number;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  requestDate: string;
}

const LeaveEncashment = () => {
  const [data, setData] = useState<LeaveEncashment[]>([
    {
      id: "1",
      employeeName: "Rahul Sharma",
      leaveType: "Paid Leave",
      availableBalance: 10,
      requestedDays: 5,
      amount: 5000,
      status: "Pending",
      requestDate: "2025-01-10",
    },
    {
      id: "2",
      employeeName: "Anjali Verma",
      leaveType: "Earned Leave",
      availableBalance: 12,
      requestedDays: 4,
      amount: 4000,
      status: "Approved",
      requestDate: "2025-01-08",
    },
  ]);

  /* ===== STATUS CHANGE ===== */
  const handleStatusChange = (
    id: string,
    newStatus: "Approved" | "Rejected"
  ) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  return (
    <div className="p-6">
      {/* PAGE HEADING */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Leave Encashment Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve employee leave encashment requests
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr className="text-left text-sm font-semibold text-gray-700">
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Available Balance</th>
              <th className="px-4 py-3">Requested Days</th>
              <th className="px-4 py-3">Amount (₹)</th>
              <th className="px-4 py-3">Request Date</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="border-t text-sm hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>

                <td className="px-4 py-3 font-medium text-orange-500">
                  {item.employeeName}
                </td>

                <td className="px-4 py-3">{item.leaveType}</td>

                <td className="px-4 py-3">{item.availableBalance} days</td>

                <td className="px-4 py-3">{item.requestedDays} days</td>

                <td className="px-4 py-3 font-semibold">₹{item.amount}</td>

                <td className="px-4 py-3">
                  {new Date(item.requestDate).toLocaleDateString()}
                </td>

                {/* STATUS DROPDOWN */}
                <td className="px-4 py-3 text-center">
                  {item.status === "Pending" ? (
                    <select
                      className="border rounded px-2 py-1 text-sm cursor-pointer"
                      defaultValue="Pending"
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as "Approved" | "Rejected"
                        )
                      }
                    >
                      <option value="Pending" disabled>
                        Pending
                      </option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveEncashment;
