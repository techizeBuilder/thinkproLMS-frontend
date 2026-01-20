/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  CalendarCheck,
  UserX,
  ClipboardList,
  Clock,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface ManagerDashboardStats {
  teamMembers: number;
  attendance: {
    present: number,
    absent: number,
  };
  approvals: {
    leaves: number,
    attendance: number,
    expenses: number,
  };
}

/* ================= CARD ================= */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
}

const SuperStatCard = ({ title, value, icon: Icon, iconBg }: StatCardProps) => (
  <div className="bg-gray-50 border rounded-2xl p-6 relative">
    <div className={`absolute right-5 top-5 p-2 rounded-full ${iconBg}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-semibold mt-3">{value}</h2>
  </div>
);

/* ================= DASHBOARD ================= */

export default function ManagerDashboard() {
  const navigate = useNavigate();
 const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        teamRes,
        attendanceRes,
        leaveRes,
        attendanceApprovalRes,
        expenseRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/users`, { headers }), // team
        axios.get(`${API_BASE}/attendance/all`, {
          headers,
          params: { year, month },
        }),
        axios.get(`${API_BASE}/employee/leaves/all`, { headers }),
        axios.get(`${API_BASE}/attendance-request/manager`, { headers }),
        axios.get(`${API_BASE}/expenses/manager`, { headers }),
      ]);

      const teamCount = teamRes.data.length;

      // 🔹 TODAY ATTENDANCE
      const present = attendanceRes.data.totalTodayPresent;
     

      

      const approvedLeavesToday = leaveRes.data.filter((lv: any) => {
        const from = lv.fromDate.split("T")[0];
        const to = lv.toDate.split("T")[0];
        return lv.status === "APPROVED" && today >= from && today <= to;
      }).length;

      const absent = teamCount - present - approvedLeavesToday;

      // 🔹 APPROVALS
      const pendingLeaves = leaveRes.data.filter(
        (lv: any) => lv.status === "PENDING"
      ).length;

      const pendingAttendance = attendanceApprovalRes.data.filter(
        (a: any) => a.status === "PENDING"
      ).length;

      const pendingExpenses = expenseRes.data.filter(
        (e: any) => e.status === "PENDING"
      ).length;

      setStats({
        teamMembers: teamCount,
        attendance: {
          present,
          absent,
        },
        approvals: {
          leaves: pendingLeaves,
          attendance: pendingAttendance,
          expenses: pendingExpenses,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader/>;
  if (!stats) return <div className="p-6 text-red-500">Failed</div>;

  return (
    <div className="p-6 bg-white min-h-screen space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <p className="text-sm text-gray-500">
          Team overview & pending approvals
        </p>
      </div>

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SuperStatCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          iconBg="bg-indigo-500"
        />
        <SuperStatCard
          title="Present Today"
          value={stats.attendance.present}
          icon={CalendarCheck}
          iconBg="bg-green-500"
        />
        <SuperStatCard
          title="Absent Today"
          value={stats.attendance.absent}
          icon={UserX}
          iconBg="bg-red-500"
        />
        <SuperStatCard
          title="Pending Leave Requests"
          value={stats.approvals.leaves}
          icon={ClipboardList}
          iconBg="bg-yellow-500"
        />
        <SuperStatCard
          title="Attendance Corrections"
          value={stats.approvals.attendance}
          icon={Clock}
          iconBg="bg-orange-500"
        />
        <SuperStatCard
          title="Expense / Travel Requests"
          value={stats.approvals.expenses}
          icon={Receipt}
          iconBg="bg-purple-500"
        />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-gray-50 border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>

        <div className="space-y-3">
          <div
            onClick={() => navigate("/hrms/manager/team")}
            className="cursor-pointer flex items-center gap-3 bg-blue-50 p-3 rounded-lg text-blue-600 hover:bg-blue-100"
          >
            <Users className="h-5 w-5" /> View Team
          </div>

          <div
            onClick={() => navigate("/hrms/manager/approvals/leaves")}
            className="cursor-pointer flex items-center gap-3 bg-green-50 p-3 rounded-lg text-green-600 hover:bg-green-100"
          >
            <ClipboardList className="h-5 w-5" /> Approve Leaves
          </div>

          <div
            onClick={() => navigate("/hrms/manager/approvals/expenses")}
            className="cursor-pointer flex items-center gap-3 bg-yellow-50 p-3 rounded-lg text-yellow-600 hover:bg-yellow-100"
          >
            <Receipt className="h-5 w-5" /> Approve Expenses
          </div>
        </div>
      </div>
    </div>
  );
}
