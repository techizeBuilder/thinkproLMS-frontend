/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import ViewPayrollModal from "./ViewPayrollModal";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

type PayrollStatus = "Draft" | "Processed" | "Paid" | "Rejected";

interface PayrollRow {
  payrollId?: string;
  userId: string;
  name: string;
  gross: number;
  deduction: number;
  net: number;
  status: PayrollStatus;
  rejectReason?: string;
  rejectedAt?: string;
}


const PayrollRun = () => {
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isPayrollRun, setIsPayrollRun] = useState(false);
  const [openPayslip, setOpenPayslip] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const token = localStorage.getItem("token");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [rejectViewModal, setRejectViewModal] = useState(false);
  const [loading,setLoading]=useState(true);
  const [rejectDetails, setRejectDetails] = useState<{
    reason: string;
    rejectedAt: string;
  } | null>(null);




  /* ================= FETCH & CALCULATE PAYROLL ================= */
  const generatePayroll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [year, monthStr] = month.split("-");
      const monthNumber = Number(monthStr);


      const [usersRes, salaryRes, leaveTypeRes, leaveRes, attendanceRes] =
        await Promise.all([
          axios.get(`${API_BASE}/users`, { headers }),
          axios.get(`${API_BASE}/salary-structures`, { headers }),
          axios.get(`${API_BASE}/leave-types`, { headers }),
          axios.get(`${API_BASE}/employee/leaves/all`, { headers }),
                axios.get(
        `${API_BASE}/attendance/all?month=${monthNumber}&year=${year}`,
        { headers }
      ),
    

        ]);

      const users = usersRes.data;
      const salaries = salaryRes.data;
      const leaveTypes = leaveTypeRes.data;
      const leaves = leaveRes.data;
      const attendance = attendanceRes.data;

      const rows: PayrollRow[] = users.map((user: any) => {
        const salary = salaries.find((s: any) => s.employee._id === user._id);
        if (!salary) return null;

        /* ===== GROSS ===== */
        const gross = salary.basic + salary.hra + salary.allowance;

        /* ===== FIXED DEDUCTION ===== */
        const fixedDeduction = salary.pf + salary.tax;

        /* ===== LEAVE DEDUCTION ===== */
        const userLeaves = leaves.filter(
          (l: any) =>
            l.employee === user._id &&
            l.status === "APPROVED" &&
            l.fromDate.startsWith(month)
        );


        let unpaidLeaveDays = 0;

        userLeaves.forEach((l: any) => {
          const lt = leaveTypes.find((t: any) => t.name === l.leaveType);
          if (lt && !lt.paid) {
            unpaidLeaveDays += l.totalDays;
          }
        });

        const perDaySalary = gross / 30;
        

        /* ===== ATTENDANCE DEDUCTION ===== */
       const userAttendance = attendance.filter(
         (a: any) => a.user._id === user._id
       );



       let attendanceDeduction = 0;

       userAttendance.forEach((att: any) => {
         const isAbsent =
           !att.punchIn && !att.punchOut && att.totalWorkSeconds === 0;

         if (!isAbsent) return;

         // check leave on that day
         const leaveOnThatDay = userLeaves.find(
           (l: any) => att.date >= l.fromDate && att.date <= l.toDate
         );

         if (leaveOnThatDay) {
           const leaveType = leaveTypes.find(
             (t: any) => t.name === leaveOnThatDay.leaveType
           );

           // paid leave → no deduction
           if (leaveType?.paid) return;

           // unpaid leave → deduction
           attendanceDeduction += perDaySalary;
         } else {
           // absent without leave
           attendanceDeduction += perDaySalary;
         }
       });



        const totalDeduction = fixedDeduction + attendanceDeduction;

       return {
         userId: user._id,
         name: user.name,
         gross: Math.round(gross),
         deduction: Math.round(totalDeduction),
         net: Math.round(gross - totalDeduction),
         status: "Draft",
       };

      });

      setPayroll(rows.filter(Boolean));
      setLoading(false);
      setIsPayrollRun(false);
    } catch (error) {
      console.error("Payroll generation failed", error);
    }
  };

  const fetchPayrollFromServer = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payroll?month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.length > 0) {
       const mapped = res.data.map((p: any) => ({
         payrollId: p._id,
         userId: p.employee._id,
         name: p.employee.name,
         gross: p.gross,
         deduction: p.deduction,
         net: p.net,
         status: p.status,
         rejectReason: p.rejectReason,
         rejectedAt: p.rejectedAt,
       }));


        setPayroll(mapped);
        setLoading(false);
        setIsPayrollRun(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const exists = await fetchPayrollFromServer();
      if (!exists) {
        generatePayroll(); // only calculate if payroll not run
      }
    })();
  }, [month]);



  /* ================= RUN PAYROLL ================= */
  const runPayroll = async () => {
    console.log("isParyrollRun",isPayrollRun);
    if (isPayrollRun) return;

    try {
      await axios.post(
        `${API_BASE}/payroll/run`,
        {
          month,
          payroll: payroll.map((p) => ({
            userId: p.userId,
            gross: p.gross,
            deduction: p.deduction,
            net: p.net,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Payroll processed for ${month}`);
      fetchPayrollFromServer();
    } catch (error) {
      console.error(error);
      alert("Payroll run failed");
    }
  };
  
  const recalculatePayroll = async (row: PayrollRow) => {
    try {
      await axios.post(
        `${API_BASE}/payroll/recalculate`,
        {
          payrollId: row.payrollId,
          gross: row.gross,
          deduction: row.deduction,
          net: row.net,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Payroll recalculated successfully");
      fetchPayrollFromServer(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Recalculation failed");
    }
  };

   if (loading) {
      return (
        <div className="relative min-h-[300px]">
          <Loader />
        </div>
      );
    }

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payroll Run</h1>
          <p className="text-sm text-gray-500">Dashboard / Payroll / Run</p>
        </div>

        <div className="flex gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          />

          <button
            onClick={runPayroll}
            disabled={isPayrollRun}
            className={`px-4 py-2 rounded-md text-white ${
              isPayrollRun ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isPayrollRun ? "Processed" : "Run Payroll"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Sr.No</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Gross</th>
              <th className="p-3">Deduction</th>
              <th className="p-3">Net</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {payroll.map((row, i) => (
              <tr key={row.userId} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">₹{row.gross}</td>
                <td className="p-3 text-red-500">₹{row.deduction}</td>
                <td className="p-3 font-semibold text-green-600">₹{row.net}</td>
                <td className="p-3 font-semibold">{row.status}</td>

                <td className="p-3 text-center relative overflow-visible">
                  <span
                    className="inline-block cursor-pointer"
                    onClick={() =>
                      setOpenMenu(openMenu === row.userId ? null : row.userId)
                    }
                  >
                    <MoreVertical size={18} />
                  </span>

                  {openMenu === row.userId && (
                    <div className="absolute right-6 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => {
                          setOpenMenu(null);
                          setSelectedPayslip({
                            name: row.name,
                            month,
                            gross: row.gross,
                            deduction: row.deduction,
                            net: row.net,
                          });
                          setOpenPayslip(true);
                        }}
                      >
                        View Payslip
                      </button>

                      {row.status === "Rejected" && (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                          onClick={() => recalculatePayroll(row)}
                        >
                          Recalculate Payroll
                        </button>
                      )}

                      {/* 👇 ONLY IF REJECTED */}
                      {row.status === "Rejected" && (
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={() => {
                            setOpenMenu(null);
                            setRejectDetails({
                              reason: row.rejectReason!,
                              rejectedAt: row.rejectedAt!,
                            });
                            setRejectViewModal(true);
                          }}
                        >
                          View Reject Reason
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ViewPayrollModal
        isOpen={openPayslip}
        onClose={() => setOpenPayslip(false)}
        data={selectedPayslip}
      />
      {rejectViewModal && rejectDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-3 text-red-600">
              Payroll Rejected
            </h2>

            <div className="mb-3">
              <p className="text-sm text-gray-500">Rejection Reason</p>
              <p className="border rounded-md p-2 mt-1 bg-gray-50">
                {rejectDetails.reason}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">Rejected On</p>
              <p className="mt-1 font-medium">
                {new Date(rejectDetails.rejectedAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setRejectViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollRun;
