/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  CalendarCheck,
  Wallet,
  CalendarX2,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface AuditorStats {
  employees: number;
  attendancePercent: number;
  payrollCount: number;
  pendingLeaves: number;
  complianceStatus: "COMPLIANT" | "PARTIAL" | "NON-COMPLIANT";
}

/* ================= CARD ================= */

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

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AuditorStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // ⚠️ backend expects 0-based

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, attendanceRes, payrollRes, leaveRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, { headers }),
        axios.get(`${API_BASE}/attendance/all`, {
          headers,
          params: { month, year },
        }),
        axios.get(`${API_BASE}/payroll`, {
          headers,
          params: { month, year },
        }),
        axios.get(`${API_BASE}/employee/leaves/all`, { headers }),
      ]);

      const totalEmployees = userRes.data.length;

      const present = attendanceRes.data.attendance.filter(
        (a: any) => a.punchIn && a.punchOut
      ).length;

      const attendancePercent = attendanceRes.data.length
        ? Math.round((present / attendanceRes.data.length) * 100)
        : 0;

      const monthLeaves = leaveRes.data.filter((l: any) => {
        const d = new Date(l.fromDate);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const pendingLeaves = monthLeaves.filter(
        (l: any) => l.status === "PENDING"
      ).length;

      let compliance: AuditorStats["complianceStatus"] = "COMPLIANT";
      if (attendancePercent < 75 || pendingLeaves > 5)
        compliance = "NON-COMPLIANT";
      else if (pendingLeaves > 0) compliance = "PARTIAL";

      setStats({
        employees: totalEmployees,
        attendancePercent,
        payrollCount: payrollRes.data.length,
        pendingLeaves,
        complianceStatus: compliance,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader/>;
  if (!stats) return <div className="p-6 text-red-500">Failed to load</div>;

  return (
    <div className="p-6 bg-white min-h-screen space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Auditor Dashboard</h1>
        <p className="text-sm text-gray-500">
          Organization compliance & monthly overview
        </p>
      </div>

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SuperStatCard
          title="Total Employees"
          value={stats.employees}
          icon={Users}
          iconBg="bg-indigo-500"
        />
        <SuperStatCard
          title="Attendance %"
          value={`${stats.attendancePercent}%`}
          icon={CalendarCheck}
          iconBg="bg-green-500"
        />
        <SuperStatCard
          title="Payroll Generated"
          value={stats.payrollCount}
          icon={Wallet}
          iconBg="bg-emerald-500"
        />
        <SuperStatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={CalendarX2}
          iconBg="bg-yellow-500"
        />
        <SuperStatCard
          title="Compliance Status"
          value={stats.complianceStatus}
          icon={ShieldCheck}
          iconBg={
            stats.complianceStatus === "COMPLIANT"
              ? "bg-green-600"
              : stats.complianceStatus === "PARTIAL"
              ? "bg-orange-500"
              : "bg-red-500"
          }
        />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-gray-50 border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Quick Access</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Action
            icon={<CalendarCheck />}
            text="Attendance Logs"
            onClick={() => navigate("/hrms/auditor/attendance")}
            color="blue"
          />
          <Action
            icon={<Wallet />}
            text="Payroll Reports"
            onClick={() => navigate("/hrms/auditor/payroll")}
            color="green"
          />
          <Action
            icon={<CalendarX2 />}
            text="Leave Records"
            onClick={() => navigate("/hrms/auditor/leaves")}
            color="orange"
          />
          <Action
            icon={<FileText />}
            text="Compliance Report"
            onClick={() => navigate("/hrms/auditor/compliance")}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= ACTION BUTTON ================= */

function Action({
  icon,
  text,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-3 bg-${color}-50 p-4 rounded-xl
      text-${color}-600 hover:bg-${color}-100 transition`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}
