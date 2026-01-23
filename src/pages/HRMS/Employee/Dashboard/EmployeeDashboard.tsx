/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarCheck,
  Wallet,
  Clock,
  IndianRupee,
  Receipt,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

interface EmployeeDashboardStats {
  attendance: {
    present: number;
    total: number;
  };
  leaves: {
    used: number;
    balance: number;
    pending: number;
  };
  payroll: {
    lastSalary: number;
    month: string;
  };
  expenses: {
    submitted: number;
  };
  goals: {
    total: number;
    completed: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
}

const EmployeeStatCard = ({
  title,
  value,
  icon: Icon,
  iconBg,
}: StatCardProps) => (
  <div className="bg-gray-50 border rounded-2xl p-6 relative">
    <div className={`absolute right-5 top-5 p-2 rounded-full ${iconBg}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-semibold mt-3">{value}</h2>
  </div>
);

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based
  const currentYear = now.getFullYear();

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();


  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        attendanceRes,
        leaveTypesRes,
        employeeLeavesRes,
        expenseRes,
        travelReqRes,
        attendanceReqRes,
        payslipRes,
        goalsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/attendance/me`, { headers }),
        axios.get(`${API_BASE}/leave-types`, { headers }),
        axios.get(`${API_BASE}/employee/leaves`, { headers }),
        axios.get(`${API_BASE}/expenses/me`, { headers }),
        axios.get(`${API_BASE}/travel-requests`, { headers }),
        axios.get(`${API_BASE}/attendance-request/me`, { headers }),
        axios.get(`${API_BASE}/payslips/me/my-payslips`, { headers }),
        axios.get(`${API_BASE}/goals/my-assigned`, { headers }),
      ]);

      /* ================= ATTENDANCE ================= */
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

     const monthlyAttendance = attendanceRes.data.filter((a: any) => {
       const d = new Date(a.date);
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
     });


      const presentCount = monthlyAttendance.filter(
        (a: any) => a.status === "PRESENT"
      ).length;

      /* ================= LEAVES ================= */
      const totalAllowedLeaves = leaveTypesRes.data.reduce(
        (sum: number, lt: any) => sum + (lt.total || 0),
        0
      );

      const approvedLeaves = employeeLeavesRes.data.filter(
        (l: any) => l.status === "Approved"
      ).length;

      const pendingLeaves = employeeLeavesRes.data.filter(
        (l: any) => l.status === "Pending"
      ).length;

      /* ================= PENDING REQUESTS ================= */
      const pendingExpenses = expenseRes.data.filter(
        (e: any) => e.status === "Pending"
      ).length;

      const pendingTravel = travelReqRes.data.filter(
        (t: any) => t.status === "Pending"
      ).length;

      const pendingAttendanceReq = attendanceReqRes.data.filter(
        (a: any) => a.status === "Pending"
      ).length;

      const totalPendingRequests =
        pendingExpenses + pendingTravel + pendingLeaves + pendingAttendanceReq;

      /* ================= PAYROLL ================= */
      const sortedPayslips = [...payslipRes.data].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const lastPayslip = sortedPayslips[0];

      /* ================= SET STATS ================= */
      setStats({
        attendance: {
          present: presentCount,
          total: totalDaysInMonth,
        },

        leaves: {
          used: approvedLeaves,
          balance: totalAllowedLeaves - approvedLeaves,
          pending: totalPendingRequests,
        },
        payroll: {
          lastSalary: lastPayslip ? lastPayslip.netSalary : 0,
          month: lastPayslip ? lastPayslip.month : "-",
        },
        expenses: {
          submitted: expenseRes.data.length,
        },
        goals: {
          total: goalsRes.data.length,
          completed: goalsRes.data.filter((g: any) => g.completed).length,
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
      <div>
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <p className="text-sm text-gray-500">
          Your attendance, salary & performance overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <EmployeeStatCard
          title="Attendance"
          value={`${stats.attendance.present}/${stats.attendance.total}`}
          icon={CalendarCheck}
          iconBg="bg-green-500"
        />
        <EmployeeStatCard
          title="Leave Balance"
          value={stats.leaves.balance}
          icon={Wallet}
          iconBg="bg-indigo-500"
        />
        <EmployeeStatCard
          title="Pending Requests"
          value={stats.leaves.pending}
          icon={Clock}
          iconBg="bg-orange-500"
        />
        <EmployeeStatCard
          title="Last Salary"
          value={`₹ ${stats.payroll.lastSalary}`}
          icon={IndianRupee}
          iconBg="bg-purple-500"
        />
        <EmployeeStatCard
          title="Expenses Submitted"
          value={stats.expenses.submitted}
          icon={Receipt}
          iconBg="bg-yellow-500"
        />
        <EmployeeStatCard
          title="Goals Progress"
          value={`${stats.goals.completed}/${stats.goals.total}`}
          icon={Target}
          iconBg="bg-blue-500"
        />
      </div>

      <div className="bg-gray-50 border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate("/hrms/employee/attendance/mark")}
            className="p-4 rounded-lg bg-green-50 text-green-600 cursor-pointer"
          >
            Mark Attendance
          </div>
          <div
            onClick={() => navigate("/hrms/employee/leave/apply")}
            className="p-4 rounded-lg bg-blue-50 text-blue-600 cursor-pointer"
          >
            Apply Leave
          </div>
          <div
            onClick={() => navigate("/hrms/employee/payroll/payslips")}
            className="p-4 rounded-lg bg-purple-50 text-purple-600 cursor-pointer"
          >
            View Payslip
          </div>
          <div
            onClick={() => navigate("/hrms/employee/performance/goals")}
            className="p-4 rounded-lg bg-orange-50 text-orange-600 cursor-pointer"
          >
            My Goals
          </div>
        </div>
      </div>
    </div>
  );
}
