/** @format */

import React, { useEffect, useMemo, useState} from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, IndianRupee, FileWarning } from "lucide-react";
import jsPDF from "jspdf";
const API = import.meta.env.VITE_API_URL;

export default function ComplianceReport() {
  /* ================= MONTH ================= */
  const now = new Date();
  const [month, setMonth] = useState(
    now.toISOString().slice(0, 7) // YYYY-MM
  );

  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;

  /* ================= DATA ================= */
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  /* ================= FETCH ALL ================= */
  useEffect(() => {
    fetchAll();
  }, [month]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [empRes, payrollRes, attendanceRes, leaveRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/payroll?month=${month}`, { headers }),
        axios.get(`${API}/attendance/all`, {
          headers,
          params: { month: monthIndex, year },
        }),
        axios.get(`${API}/employee/leaves/all`, { headers }),
      ]);

      setEmployees(empRes.data || []);
      setPayroll(payrollRes.data || []);
      setAttendance(attendanceRes.data || []);
      setLeaves(leaveRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= COMPLIANCE CALCULATIONS ================= */

  // 1️⃣ Employee Compliance
  const employeeCompliance = useMemo(() => {
    const total = employees.length;
    const verified = employees.filter((e) => e.isVerified).length;
    const missingProfile = employees.filter((e) => !e.email || !e.name).length;

    return {
      total,
      verified,
      missingProfile,
      status: missingProfile > 0 ? "PARTIAL" : "OK",
    };
  }, [employees]);

  // 2️⃣ Payroll Compliance
  const payrollCompliance = useMemo(() => {
    const totalEmployees = employees.length;
    const payrollDone = payroll.length;
    const negativeNet = payroll.filter((p) => p.net < 0).length;

    return {
      payrollDone,
      totalEmployees,
      negativeNet,
      status:
        payrollDone < totalEmployees || negativeNet > 0 ? "ATTENTION" : "OK",
    };
  }, [payroll, employees]);

  // 3️⃣ Attendance Compliance
  const attendanceCompliance = useMemo(() => {
    const totalRecords = attendance.length;
    const present = attendance.filter((a) => a.punchIn).length;
    const absent = totalRecords - present;

    return {
      present,
      absent,
      status: absent > present * 0.2 ? "ATTENTION" : "OK",
    };
  }, [attendance]);

  // 4️⃣ Leave Compliance (frontend filter by month)
  const leaveCompliance = useMemo(() => {
    const monthLeaves = leaves.filter((l) => {
      const d = new Date(l.fromDate);
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });

    const pending = monthLeaves.filter((l) => l.status === "PENDING").length;

    return {
      total: monthLeaves.length,
      pending,
      status: pending > 0 ? "PARTIAL" : "OK",
    };
  }, [leaves, month]);

  /* ================= OVERALL ================= */
  const overallStatus = useMemo(() => {
    const statuses = [
      employeeCompliance.status,
      payrollCompliance.status,
      attendanceCompliance.status,
      leaveCompliance.status,
    ];

    return statuses.some((s) => s !== "OK")
      ? "PARTIALLY COMPLIANT"
      : "COMPLIANT";
  }, [
    employeeCompliance,
    payrollCompliance,
    attendanceCompliance,
    leaveCompliance,
  ]);

const handleDownloadPDF = () => {
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 20;

  pdf.setFontSize(18);
  pdf.text(`Compliance Report - ${month}`, 20, y);

  y += 12;
  pdf.setFontSize(12);
  pdf.text(`Employees: ${employeeCompliance.total}`, 20, y);

  y += 8;
  pdf.text(`Missing Profile: ${employeeCompliance.missingProfile}`, 20, y);

  y += 8;
  pdf.text(`Payroll Done: ${payrollCompliance.payrollDone}`, 20, y);

  y += 8;
  pdf.text(`Negative Net Payrolls: ${payrollCompliance.negativeNet}`, 20, y);

  y += 8;
  pdf.text(`Attendance Present: ${attendanceCompliance.present}`, 20, y);

  y += 8;
  pdf.text(`Attendance Absent: ${attendanceCompliance.absent}`, 20, y);

  y += 8;
  pdf.text(`Total Leaves: ${leaveCompliance.total}`, 20, y);

  y += 8;
  pdf.text(`Pending Leaves: ${leaveCompliance.pending}`, 20, y);

  y += 12;
  pdf.setFontSize(14);
  pdf.text(`Overall Status: ${overallStatus}`, 20, y);

  pdf.save(`Compliance_Report_${month}.pdf`);
};




  if (loading) return <p className="p-6">Loading compliance report...</p>;

  return (
    <div id="compliance-report" className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Compliance Report – {month}</h1>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-md
                 bg-gradient-to-r from-indigo-500 to-purple-600
                 text-white text-sm font-semibold
                 hover:from-indigo-600 hover:to-purple-700
                 transition shadow-md"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

    <div id="pdf-area" className="space-y-6 bg-white p-4">

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComplianceCard
          title="Employee Compliance"
          icon={<Users />}
          color="bg-blue-100 text-blue-700"
          lines={[
            `Total: ${employeeCompliance.total}`,
            `Missing Profile: ${employeeCompliance.missingProfile}`,
          ]}
          status={employeeCompliance.status}
        />

        <ComplianceCard
          title="Payroll Compliance"
          icon={<IndianRupee />}
          color="bg-green-100 text-green-700"
          lines={[
            `Payroll Done: ${payrollCompliance.payrollDone}`,
            `Negative Net: ${payrollCompliance.negativeNet}`,
          ]}
          status={payrollCompliance.status}
        />

        <ComplianceCard
          title="Attendance Compliance"
          icon={<CalendarCheck />}
          color="bg-purple-100 text-purple-700"
          lines={[
            `Present: ${attendanceCompliance.present}`,
            `Absent: ${attendanceCompliance.absent}`,
          ]}
          status={attendanceCompliance.status}
        />

        <ComplianceCard
          title="Leave Compliance"
          icon={<FileWarning />}
          color="bg-orange-100 text-orange-700"
          lines={[
            `Total Leaves: ${leaveCompliance.total}`,
            `Pending: ${leaveCompliance.pending}`,
          ]}
          status={leaveCompliance.status}
        />
      </div>
    

      {/* ================= OVERALL ================= */}
      <Card
        className={`border-l-8 ${
          overallStatus === "COMPLIANT"
            ? "border-green-500"
            : "border-yellow-500"
        }`}
      >
        <CardHeader>
          <CardTitle>Overall Compliance Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold">{overallStatus}</p>
        </CardContent>
      </Card>
     </div> 
    </div>
  );
}

/* ================= SMALL CARD ================= */
function ComplianceCard({
  title,
  icon,
  color,
  lines,
  status,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  lines: string[];
  status: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="text-sm space-y-1">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>

      <p className="mt-2 font-bold text-sm">Status: {status}</p>
    </div>
  );
}
