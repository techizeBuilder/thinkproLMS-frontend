/** @format */

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/* ================= TYPES ================= */

type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRequest {
  id: string;
  employee: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

/* ================= STATIC DATA ================= */

const initialLeaves: LeaveRequest[] = [
  {
    id: "1",
    employee: "Rahul Sharma",
    leaveType: "Casual Leave",
    from: "2025-01-12",
    to: "2025-01-13",
    days: 2,
    reason: "Personal work",
    status: "PENDING",
  },
  {
    id: "2",
    employee: "Neha Verma",
    leaveType: "Earned Leave",
    from: "2025-01-05",
    to: "2025-01-10",
    days: 6,
    reason: "Family function",
    status: "APPROVED",
  },
];

/* ================= COMPONENT ================= */

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);

  const updateStatus = (id: string, status: LeaveStatus) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const statusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dashboard / Leave Management / Requests
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Employee</th>
              <th className="px-4 py-3 text-left font-medium">Leave Type</th>
              <th className="px-4 py-3 text-left font-medium">From</th>
              <th className="px-4 py-3 text-left font-medium">To</th>
              <th className="px-4 py-3 text-center font-medium">Days</th>
              <th className="px-4 py-3 text-left font-medium">Reason</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-t">
                <td className="px-4 py-3 font-medium">{leave.employee}</td>

                <td className="px-4 py-3">{leave.leaveType}</td>

                <td className="px-4 py-3">{leave.from}</td>

                <td className="px-4 py-3">{leave.to}</td>

                <td className="px-4 py-3 text-center">{leave.days}</td>

                <td className="px-4 py-3">{leave.reason}</td>

                {/* STATUS DROPDOWN */}
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col gap-2 items-center">
                    {statusBadge(leave.status)}

                    <Select
                      value={leave.status}
                      onValueChange={(val: LeaveStatus) =>
                        updateStatus(leave.id, val)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequests;
