/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import { X } from "lucide-react";
const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

type ClearanceStatus = "PENDING" | "CLEARED" | "ISSUE";

interface Row {
  clearanceId: string;
  employee: {
    _id: string;
    name: string;
    role: string;
  };
  emailStatus: string;
  assetStatus: string;
  licenseStatus: string;
  itStatus: ClearanceStatus;

  assets: any[];
  licenses: any[];
  lastWorkingDay: string;
}


/* ================= COMPONENT ================= */

export default function ITClearanceDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewRow, setViewRow] = useState<Row | null>(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  /* ================= FETCH DATA ================= */

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [clearanceRes, assetRes, licenseRes] = await Promise.all([
        axios.get(`${API}/clearances`, { headers }),
        axios.get(`${API}/asset`, { headers }),
        axios.get(`${API}/license/assigned`, { headers }),
      ]);

      const clearances = clearanceRes.data;
      const assets = assetRes.data;
      const licenses = licenseRes.data;

      const mapped: Row[] = clearances.map((c: any) => {
  const empId = c.employee._id;

  const employeeAssets = assets.filter(
    (a: any) => a.assignedTo?._id === empId
  );

  const employeeLicenses = licenses.filter(
    (l: any) => l.user?._id === empId
  );

  const itClearance = c.clearances.find(
    (x: any) => x.department === "IT"
  );

  return {
    clearanceId: c._id,
    employee: c.employee,
    lastWorkingDay: c.lastWorkingDay,

    emailStatus: "DEACTIVATED",

    assetStatus: employeeAssets.length
      ? "ALLOCATED"
      : "DEALLOCATED",

    licenseStatus: employeeLicenses.length
      ? "ALLOCATED"
      : "DEALLOCATED",

    itStatus: itClearance?.status || "PENDING",

    assets: employeeAssets,
    licenses: employeeLicenses,
  };
});


      setRows(mapped);
    } catch (err) {
      console.error("IT Dashboard Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================= UPDATE IT STATUS ================= */

  const updateITStatus = async (
    clearanceId: string,
    status: ClearanceStatus
  ) => {
    await axios.patch(
      `${API}/clearances/${clearanceId}/department`,
      {
        department: "IT",
        status,
      },
      { headers }
    );

    fetchDashboard();
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="p-6">Loading IT Clearance...</p>;
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">IT Clearance Dashboard</h1>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Assets</th>
              <th className="p-4 text-left">Licenses</th>
              <th className="p-4 text-left">IT Clearance</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.clearanceId}
                className="border-t text-sm hover:bg-gray-50"
              >
                <td className="p-4 font-medium">{row.employee.name}</td>

                <td className="p-4">{row.employee.role}</td>

                {/* EMAIL */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.emailStatus === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.emailStatus}
                  </span>
                </td>

                {/* ASSET */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.assetStatus === "ALLOCATED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.assetStatus}
                  </span>
                </td>

                {/* LICENSE */}
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.licenseStatus === "ALLOCATED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {row.licenseStatus}
                  </span>
                </td>

                {/* IT CLEARANCE */}
                <td className="p-4">
                  {row.itStatus === "CLEARED" ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      ✔ Cleared
                    </span>
                  ) : row.itStatus === "ISSUE" ? (
                    <select
                      value={row.itStatus}
                      onChange={(e) =>
                        updateITStatus(
                          row.clearanceId,
                          e.target.value as ClearanceStatus
                        )
                      }
                      className="border border-red-300 bg-red-50 text-red-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-red-300"
                    >
                      <option value="ISSUE">Issue</option>
                      <option value="PENDING">Pending</option>
                      <option value="CLEARED">Mark Approved</option>
                    </select>
                  ) : (
                    <select
                      value={row.itStatus}
                      onChange={(e) =>
                        updateITStatus(
                          row.clearanceId,
                          e.target.value as ClearanceStatus
                        )
                      }
                      className="border border-yellow-300 bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-300"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CLEARED">Mark Approved</option>
                      <option value="ISSUE">Issue</option>
                    </select>
                  )}
                </td>

                {/* ACTION */}
                <td className="p-4">
                  <td className="p-4">
                    <button
                      onClick={() => setViewRow(row)}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {viewRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setViewRow(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-6">IT Clearance Details</h2>

            {/* EMPLOYEE INFO */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <p>
                <b>Name:</b> {viewRow.employee.name}
              </p>
              <p>
                <b>Role:</b> {viewRow.employee.role}
              </p>
              <p>
                <b>Last Working Day:</b>{" "}
                {new Date(viewRow.lastWorkingDay).toDateString()}
              </p>
              <p>
                <b>IT Status:</b>{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold
            ${
              viewRow.itStatus === "CLEARED"
                ? "bg-green-100 text-green-700"
                : viewRow.itStatus === "ISSUE"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }
          `}
                >
                  {viewRow.itStatus}
                </span>
              </p>
            </div>

            {/* EMAIL */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Email</h3>
              <span className="px-3 py-1 rounded-full text-xs bg-gray-100">
                Deactivated
              </span>
            </div>

            {/* ASSETS */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Assets</h3>

              {viewRow.assets.length === 0 ? (
                <p className="text-sm text-gray-500">No assets assigned</p>
              ) : (
                <div className="space-y-2">
                  {viewRow.assets.map((a: any) => (
                    <div key={a._id} className="border rounded-lg p-3 text-sm">
                      <p>
                        <b>{a.assetType}</b> ({a.serialNumber})
                      </p>
                      <p className="text-gray-500">
                        Accessories: {a.accessories.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LICENSES */}
            <div>
              <h3 className="font-semibold mb-2">Licenses</h3>

              {viewRow.licenses.length === 0 ? (
                <p className="text-sm text-gray-500">No active licenses</p>
              ) : (
                <div className="space-y-2">
                  {viewRow.licenses.map((l: any) => (
                    <div key={l._id} className="border rounded-lg p-3 text-sm">
                      <p>
                        <b>{l.software}</b>
                      </p>
                      <p className="text-gray-500">
                        Key: {l.licenseKey || "N/A"}
                      </p>
                      <p className="text-gray-500">Status: {l.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
