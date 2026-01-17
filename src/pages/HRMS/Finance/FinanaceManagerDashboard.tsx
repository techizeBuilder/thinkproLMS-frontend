/** @format */

import { useEffect, useState } from "react";
import axios from "@/api/axiosInstance";
import {
  IndianRupee,
  FileCheck,
  Wallet,
  Receipt,
  Plane,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================= TYPES ================= */

interface FinanceStats {
  payroll: {
    total: number;
    paid: number;
    processed: number;
  };
  expenses: {
    total: number;
    paid: number;
    pending: number;
  };
  travel: {
    total: number;
    approved: number;
    pending: number;
  };
}

/* ================= STAT CARD ================= */

interface CardProps {
  title: string;
  value: number;
  icon: any;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: CardProps) => (
  <div className="bg-gray-50 border rounded-2xl p-6 relative hover:shadow-md transition">
    <div className={`absolute right-5 top-5 p-2 rounded-full ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-semibold mt-3">{value}</h2>
  </div>
);

/* ================= DASHBOARD ================= */

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const month = "2026-01";

      const [payrollRes, expenseRes, travelRes] = await Promise.all([
        axios.get(`/payroll`, { params: { month } }),
        axios.get(`/expenses/all`),
        axios.get(`/travel-requests`),
      ]);

      // ✅ REAL DATA ARRAYS
      const payrolls = payrollRes.data.data || [];
      const expenses = expenseRes.data.data || [];
      const travels = travelRes.data.data || [];

      /* ================= PAYROLL ================= */
      const payrollPaid = payrolls.filter(
        (p: any) => p.status === "Paid"
      ).length;

      const payrollProcessed = payrolls.filter(
        (p: any) => p.status === "Processed"
      ).length;

      /* ================= EXPENSES ================= */
      const expensePaid = expenses.filter(
        (e: any) => e.status === "PAID"
      ).length;

      const expensePending = expenses.filter(
        (e: any) => e.status === "PENDING"
      ).length;

      /* ================= TRAVEL ================= */
      const travelApproved = travels.filter(
        (t: any) => t.status === "APPROVED"
      ).length;

      const travelPending = travels.filter(
        (t: any) => t.status === "PENDING"
      ).length;

      setStats({
        payroll: {
          total: payrolls.length,
          paid: payrollPaid,
          processed: payrollProcessed,
        },
        expenses: {
          total: expenses.length,
          paid: expensePaid,
          pending: expensePending,
        },
        travel: {
          total: travels.length,
          approved: travelApproved,
          pending: travelPending,
        },
      });
    } catch (err) {
      console.error("Finance Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!stats) return <div className="p-6 text-red-500">Failed</div>;

  return (
    <div className="p-6 bg-white min-h-screen space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">Finance Dashboard</h1>
        <p className="text-sm text-gray-500">
          Payroll, expenses & travel overview
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Payrolls"
          value={stats.payroll.total}
          icon={IndianRupee}
          color="bg-indigo-500"
        />
        <StatCard
          title="Payroll Paid"
          value={stats.payroll.paid}
          icon={FileCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Payroll Processed"
          value={stats.payroll.processed}
          icon={Clock}
          color="bg-yellow-500"
        />

        <StatCard
          title="Expense Claims"
          value={stats.expenses.total}
          icon={Wallet}
          color="bg-blue-500"
        />
        <StatCard
          title="Expenses Paid"
          value={stats.expenses.paid}
          icon={Receipt}
          color="bg-green-600"
        />
        <StatCard
          title="Expenses Pending"
          value={stats.expenses.pending}
          icon={Clock}
          color="bg-orange-500"
        />

        <StatCard
          title="Travel Requests"
          value={stats.travel.total}
          icon={Plane}
          color="bg-purple-500"
        />
        <StatCard
          title="Travel Approved"
          value={stats.travel.approved}
          icon={FileCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Travel Pending"
          value={stats.travel.pending}
          icon={Clock}
          color="bg-red-500"
        />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-gray-50 border rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => navigate("/hrms/finance/payroll/review")}
            className="cursor-pointer bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex items-center gap-3 text-blue-600"
          >
            <FileCheck /> Review Payroll
          </div>

          <div
            onClick={() => navigate("/hrms/finance/expenses")}
            className="cursor-pointer bg-green-50 hover:bg-green-100 p-4 rounded-xl flex items-center gap-3 text-green-600"
          >
            <Receipt /> Expense Claims
          </div>

          <div
            onClick={() => navigate("/hrms/finance/travel/advances")}
            className="cursor-pointer bg-purple-50 hover:bg-purple-100 p-4 rounded-xl flex items-center gap-3 text-purple-600"
          >
            <Plane /> Travel Requests
          </div>

          <div
            onClick={() => navigate("/hrms/finance/statutory/reports")}
            className="cursor-pointer bg-orange-50 hover:bg-orange-100 p-4 rounded-xl flex items-center gap-3 text-orange-600"
          >
            <FileCheck /> Statutory Reports
          </div>
        </div>
      </div>
    </div>
  );
}
