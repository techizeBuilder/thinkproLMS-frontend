/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import ViewPayrollModal from "../../Admin/Payroll/ViewPayrollModal";
import Loader from "../../Loader";
import { toast } from "../../Alert/Toast";
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
}

const FinancePayroll = () => {
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [openPayslip, setOpenPayslip] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(
    null
  );

  const token = localStorage.getItem("token");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [loading,setLoading]=useState(true);

  /* ================= FETCH PAYROLL (ONLY HR RUN DATA) ================= */
  const fetchPayrollFromServer = async () => {
    try {
      const res = await axios.get(`${API_BASE}/payroll?month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((p: any) => ({
        payrollId: p._id,
        userId: p.employee._id,
        name: p.employee.name,
        gross: p.gross,
        deduction: p.deduction,
        net: p.net,
        status: p.status,
      }));

      setPayroll(mapped);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayrollFromServer();
  }, [month]);

  /* ================= UPDATE STATUS ================= */
const updateStatus = async (
  payrollId: string,
  status: PayrollStatus,
  reason?: string,
) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/payroll/${payrollId}/status`,
      { status, rejectionReason: reason },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setPayroll((prev) =>
      prev.map((p) => (p.payrollId === payrollId ? { ...p, status } : p)),
    );

    toast({
      type: "success",
      title: "Payroll Updated",
      message: res?.data?.message || `Payroll status updated to ${status}.`,
    });

    setLoading(false);
  } catch (error: any) {
    toast({
      type: "error",
      title: "Update Failed",
      message:
        error?.response?.data?.message ||
        "Status update failed. Please try again.",
    });
    console.error(error);
  }
};

const rejectPayroll = async (payrollId: string, reason: string) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/payroll/${payrollId}/reject`,
      { reason: reason },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setPayroll((prev) =>
      prev.map((p) =>
        p.payrollId === payrollId ? { ...p, status: "Rejected" } : p,
      ),
    );

    toast({
      type: "success",
      title: "Payroll Rejected",
      message: res?.data?.message || "Payroll has been rejected successfully.",
    });
  } catch (error: any) {
    toast({
      type: "error",
      title: "Rejection Failed",
      message:
        error?.response?.data?.message || "Reject failed. Please try again.",
    });
    console.error(error);
  }
};


  if(loading)return<Loader/>;
  /* ================= UI ================= */
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Payroll Review</h1>
          <p className="text-sm text-gray-500">Finance / Payroll / Review</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded-md"
        />
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
                <td className="p-3">
                  {row.status === "Rejected" ? (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  ) : (
                    <select
                      value={row.status}
                      onChange={(e) =>
                        updateStatus(
                          row.payrollId!,
                          e.target.value as PayrollStatus
                        )
                      }
                      className="border rounded-md px-2 py-1 text-sm bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Processed">Processed</option>
                      <option value="Paid">Paid</option>
                    </select>
                  )}
                </td>

                <td className="p-3 relative">
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenMenu(openMenu === row.userId ? null : row.userId)
                    }
                  >
                    <MoreVertical size={18} />
                  </span>

                  {openMenu === row.userId && (
                    <div className="absolute right-6 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                      <button
                        className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
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

                      {row.status === "Processed" && (
                        <>
                          <button
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                            onClick={() => {
                              setOpenMenu(null);
                              setSelectedPayrollId(row.payrollId!);
                              setRejectModal(true);
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-3">Reject Payroll</h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="w-full border rounded-md p-2 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    alert("Rejection reason required");
                    return;
                  }

                  rejectPayroll(selectedPayrollId!, rejectReason);

                  setRejectReason("");
                  setRejectModal(false);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <ViewPayrollModal
        isOpen={openPayslip}
        onClose={() => setOpenPayslip(false)}
        data={selectedPayslip}
      />
    </div>
  );
};

export default FinancePayroll;
