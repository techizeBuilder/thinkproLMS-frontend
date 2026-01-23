/** @format */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, ShieldCheck, ShieldX, Percent } from "lucide-react";
import Loader from "../Loader";

const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface User {
  _id: string;
  name: string;
  employeeId: string;
}

/* 🔴 ATTENDANCE TYPE FIX */
interface Attendance {
  user: {
    _id: string;
  };
}

interface Leave {
  employee: {
    _id: string;
  };
  status: string;
}

interface Payroll {
  employee: {
    _id: string;
  };
  status: string;
}

interface ComplianceRow {
  employee: User;
  attendanceOk: boolean;
  leaveOk: boolean;
  payrollOk: boolean;
  compliant: boolean;
}

/* ================= COMPONENT ================= */

export default function Compliance() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    try {
      const [u, a, l, p] = await Promise.all([
        axios.get(`${API}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/attendance/all?month=0&year=2026`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/employee/leaves/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/payroll?month=2026-01`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(u.data || []);
      /* 🔴 ATTENDANCE RESPONSE FIX */
      setAttendance(a.data.attendance || []);
      setLeaves(l.data || []);
      setPayroll(p.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= COMPLIANCE LOGIC ================= */

  const complianceData: ComplianceRow[] = useMemo(() => {
    return users.map((user) => {
      /* 🔴 ATTENDANCE LOGIC FIX */
      const hasAttendance = attendance.some((a) => a.user?._id === user._id);

      const leave = leaves.find((l) => l.employee?._id === user._id);
      const pay = payroll.find((p) => p.employee?._id === user._id);

      const attendanceOk = hasAttendance;
      const leaveOk = !leave || leave.status !== "REJECTED";
      const payrollOk = pay
        ? ["Paid", "Processed"].includes(pay.status)
        : false;

      return {
        employee: user,
        attendanceOk,
        leaveOk,
        payrollOk,
        compliant: attendanceOk && leaveOk && payrollOk,
      };
    });
  }, [users, attendance, leaves, payroll]);

  /* ================= FILTER ================= */

  const filtered = complianceData.filter((r) =>
    r.employee.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= SUMMARY ================= */

  const total = filtered.length;
  const compliantCount = filtered.filter((r) => r.compliant).length;
  const nonCompliant = total - compliantCount;
  const percent = total ? Math.round((compliantCount / total) * 100) : 0;

  if (loading) return <Loader />;

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Compliance Report</h1>
        <Input
          placeholder="Search employee..."
          className="md:w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Employees" value={total} icon={<Users />} />
        <SummaryCard
          title="Compliant"
          value={compliantCount}
          icon={<ShieldCheck />}
          color="text-green-600"
        />
        <SummaryCard
          title="Non-Compliant"
          value={nonCompliant}
          icon={<ShieldX />}
          color="text-red-600"
        />
        <SummaryCard
          title="Compliance %"
          value={`${percent}%`}
          icon={<Percent />}
          color="text-blue-600"
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="font-semibold">Employee Compliance</CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Leave</TableHead>
                  <TableHead className="text-center">Payroll</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.employee._id}>
                    <TableCell>
                      <div className="font-medium">{r.employee.name}</div>
                      <div className="text-xs text-gray-400">
                        {r.employee.employeeId}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {r.attendanceOk ? "✅" : "❌"}
                    </TableCell>

                    <TableCell className="text-center">
                      {r.leaveOk ? "✅" : "❌"}
                    </TableCell>

                    <TableCell className="text-center">
                      {r.payrollOk ? "✅" : "❌"}
                    </TableCell>

                    <TableCell className="text-center">
                      {r.compliant ? (
                        <Badge variant="success">COMPLIANT</Badge>
                      ) : (
                        <Badge variant="destructive">NON-COMPLIANT</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================= SUMMARY CARD ================= */

function SummaryCard({ title, value, icon, color = "text-gray-700" }: any) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className={`text-2xl font-semibold ${color}`}>{value}</div>
        </div>
        <div className="text-gray-400">{icon}</div>
      </CardContent>
    </Card>
  );
}
