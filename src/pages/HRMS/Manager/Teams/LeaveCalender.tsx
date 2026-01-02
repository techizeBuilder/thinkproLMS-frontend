/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

interface Leave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
}

const LeaveCalendar = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get(`${API_BASE}/leaves/manager/today`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setLeaves(res.data || []);
      } catch (err) {
        console.error("Failed to fetch leaves", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Today’s Team Leave Calendar</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-gray-500">
              <CalendarOff size={40} />
              <p className="mt-2 text-sm">No team member is on leave today</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Employee</th>
                    <th className="border px-3 py-2">Role</th>
                    <th className="border px-3 py-2">Leave Type</th>
                    <th className="border px-3 py-2">From</th>
                    <th className="border px-3 py-2">To</th>
                    <th className="border px-3 py-2">Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="border px-3 py-2 font-medium">
                        {leave.user.name}
                      </td>
                      <td className="border px-3 py-2">{leave.user.role}</td>
                      <td className="border px-3 py-2">{leave.leaveType}</td>
                      <td className="border px-3 py-2">{leave.startDate}</td>
                      <td className="border px-3 py-2">{leave.endDate}</td>
                      <td className="border px-3 py-2">
                        {leave.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveCalendar;
