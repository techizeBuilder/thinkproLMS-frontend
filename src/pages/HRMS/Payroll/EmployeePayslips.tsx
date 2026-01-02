/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import ViewPayslipModal from "./ViewPayslipModal";
import { Download, Eye, Building2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const EmployeePayslips = () => {
  const token = localStorage.getItem("token");
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = loggedInUser?.id;
  const [payslips, setPayslips] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [company, setCompany] = useState("");

  /* ================= FETCH ================= */
  const fetchPayslips = async () => {
    const res = await axios.get(`${API_BASE}/payslips/me/my-payslips`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPayslips(res.data || []);
    setFiltered(res.data || []);
  };

  const fetchCompany = async () => {
    const res = await axios.get(`${API_BASE}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompany(res.data?.companyId?.name || "Your Company");
  };

  useEffect(() => {
    fetchPayslips();
    fetchCompany();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let data = [...payslips];

    if (month) {
      data = data.filter(
        (p) => new Date(p.month).getMonth() + 1 === Number(month)
      );
    }

    if (year) {
      data = data.filter(
        (p) => new Date(p.month).getFullYear() === Number(year)
      );
    }

    setFiltered(data);
  }, [month, year, payslips]);

  /* ================= HELPERS ================= */
  const formatMonth = (date: string) =>
    new Date(date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

  const downloadPayslip = async (id: string, month: string) => {
    const res = await axios.get(`${API_BASE}/payslips/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Payslip-${formatMonth(month)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  /* ================= UI ================= */
  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payslips</h2>
          <p className="text-sm text-gray-500">HRMS / Payroll / Payslips</p>
        </div>

        <div className="flex items-center gap-2 mt-3 sm:mt-0 text-sm bg-white px-4 py-2 rounded-lg shadow">
          <Building2 size={16} />
          <span className="font-medium">{company}</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">Year</option>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* PAYSLIP CARDS */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p._id}
            className="relative bg-gradient-to-br from-indigo-500 to-gray-500 text-white rounded-2xl shadow-lg p-5"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Payslip – {formatMonth(p.month)}
                </h3>
                <p className="text-xs opacity-80">{company}</p>
              </div>

              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                {p.status}
              </span>
            </div>

            {/* PAY */}
            <div className="mb-4">
              <p className="text-sm opacity-80">Net Pay</p>
              <p className="text-2xl font-bold">₹{p.netSalary}</p>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelected(p)}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm flex items-center justify-center gap-2"
              >
                <Eye size={16} /> View
              </button>

              <button
                onClick={() => downloadPayslip(p._id, p.month)}
                className="flex-1 bg-black/30 hover:bg-black/40 rounded-lg py-2 text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No payslips found</p>
      )}

      {/* VIEW MODAL */}
      {selected && (
        <ViewPayslipModal
          data={selected}
          onClose={() => setSelected(null)}
          onDownload={() => downloadPayslip(selected._id, selected.month)}
        />
      )}
    </div>
  );
};

export default EmployeePayslips;
