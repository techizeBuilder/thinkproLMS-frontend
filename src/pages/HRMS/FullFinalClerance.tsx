/** @format */
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Employee {
  _id: string;
  name: string;
  employeeCode: string;
  department: string;
}

interface ClearanceRow {
  employee: Employee;
  accessCleared: boolean;
  deskCleared: boolean;
  assetsCleared: boolean;
}

export default function FullFinalClearance() {
  const [rows, setRows] = useState<ClearanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  /* ================= FETCH CLEARANCE DATA ================= */
  const fetchClearance = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/clearances`, {
        headers,
      });

      setRows(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearance();
  }, []);

  const getBadge = (ok: boolean) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {ok ? "CLEARED" : "PENDING"}
    </span>
  );

  if (loading) return <p>Loading clearance data...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">Full & Final Clearance</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Access Card</th>
              <th className="p-3">Workstation</th>
              <th className="p-3">Assets</th>
              <th className="p-3">Final Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const finalCleared =
                row.accessCleared && row.deskCleared && row.assetsCleared;

              return (
                <tr key={row.employee._id} className="border-t text-center">
                  <td className="p-3 font-medium text-left">
                    {row.employee.name}
                    <div className="text-xs text-gray-500">
                      {row.employee.employeeCode}
                    </div>
                  </td>

                  <td className="p-3">{getBadge(row.accessCleared)}</td>

                  <td className="p-3">{getBadge(row.deskCleared)}</td>

                  <td className="p-3">{getBadge(row.assetsCleared)}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        finalCleared
                          ? "bg-green-600 text-white"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {finalCleared ? "CLEARED" : "IN PROGRESS"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
