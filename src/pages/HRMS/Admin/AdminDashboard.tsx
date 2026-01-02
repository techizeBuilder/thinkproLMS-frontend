/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  CalendarCheck,
  UserX,
  Clock,
  FileText,
  IndianRupee,
  Plus,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface DashboardStats {
  employees: number;
  attendance: {
    present: number;
    absent: number;
    leave: number;
  };
  leaves: {
    pending: number;
  };
  payroll: {
    month: string;
    status: "Draft" | "Processed" | "Paid";
    netPayable: number;
  };
}

/* ================= SUPERADMIN STYLE CARD ================= */

interface StatCardProps {
  title: string;
  value: string | number;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

      const [empRes, attendanceRes, leaveRes, payrollRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, { headers }),
        axios.get(`${API_BASE}/attendance/all`, {
          headers,
          params: { year, month },
        }),
        axios.get(`${API_BASE}/employee/leaves/all`, { headers }),
        axios.get(`${API_BASE}/payroll`, {
          headers,
          params: { year, month },
        }),
      ]);

      const employeesCount = empRes.data.length;

      const todayAttendance = attendanceRes.data.filter(
        (a: any) => a.date === today
      );

      const present = todayAttendance.filter((a: any) => a.punchIn).length;

      const approvedLeavesToday = leaveRes.data.filter((lv: any) => {
        const from = lv.fromDate.split("T")[0];
        const to = lv.toDate.split("T")[0];
        return lv.status === "APPROVED" && today >= from && today <= to;
      }).length;

      const absent = employeesCount - present - approvedLeavesToday;

      let payrollStatus: "Draft" | "Processed" | "Paid" = "Draft";
      if (payrollRes.data.some((p: any) => p.status === "Paid"))
        payrollStatus = "Paid";
      else if (payrollRes.data.some((p: any) => p.status === "Processed"))
        payrollStatus = "Processed";

      const netPayable = payrollRes.data.reduce(
        (s: number, p: any) => s + (p.net || 0),
        0
      );

      setStats({
        employees: employeesCount,
        attendance: {
          present,
          absent,
          leave: approvedLeavesToday,
        },
        leaves: {
          pending: leaveRes.data.filter((lv: any) => lv.status === "PENDING")
            .length,
        },
        payroll: {
          month: `${year}-${month}`,
          status: payrollStatus,
          netPayable,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!stats) return <div className="p-6 text-red-500">Failed</div>;

  return (
    <div className="p-6 bg-white min-h-screen space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of employee & payroll system
        </p>
      </div>

      {/* ================= TOP CARDS (EXACT SUPERADMIN STYLE) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        <SuperStatCard
          title="Total Employees"
          value={stats.employees}
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
          title="On Leave"
          value={stats.attendance.leave}
          icon={ClipboardCheck}
          iconBg="bg-yellow-500"
        />
        <SuperStatCard
          title="Pending Leaves"
          value={stats.leaves.pending}
          icon={Clock}
          iconBg="bg-orange-500"
        />
        <SuperStatCard
          title="Net Salary"
          value={`₹ ${stats.payroll.netPayable}`}
          icon={IndianRupee}
          iconBg="bg-purple-500"
        />
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QUICK ACTIONS */}
        <div className="bg-gray-50 border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>

          <div className="space-y-3">
            <div
              onClick={() => navigate("/hrms/admin/addUser")}
              className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg text-blue-600"
            >
              <Plus className="h-5 w-5" /> Add Employee
            </div>
            <div
              onClick={() => navigate("/hrms/admin/leaves")}
              className="flex items-center gap-3 bg-green-50 p-3 rounded-lg text-green-600"
            >
              <UserPlus className="h-5 w-5" /> Approve Leave
            </div>
            <div
              onClick={() => navigate("/hrms/admin/payroll/run")}
              className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg text-yellow-600"
            >
              <FileText className="h-5 w-5" /> Process Payroll
            </div>
          </div>
        </div>

        {/* SYSTEM OVERVIEW */}
        <div className="bg-gray-50 border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">System Overview</h3>

          <div className="space-y-2 text-sm">
            <p>
              Total Employees: <b>{stats.employees}</b>
            </p>
            <p>
              Present Today: <b>{stats.attendance.present}</b>
            </p>
            <p>
              Absent Today: <b>{stats.attendance.absent}</b>
            </p>
            <p>
              On Leave: <b>{stats.attendance.leave}</b>
            </p>
            <p>
              Pending Leaves: <b>{stats.leaves.pending}</b>
            </p>
            <hr />
            <p>
              Payroll Status: <b>{stats.payroll.status}</b>
            </p>
            <p className="font-semibold">
              Net Payable: ₹ {stats.payroll.netPayable}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
