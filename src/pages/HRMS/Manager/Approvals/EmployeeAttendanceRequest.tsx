/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

const EmployeeAttendanceRequest = () => {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState<any[]>([]);
  const [view, setView] = useState<any>(null);
  const [loading,setLoading]=useState(true);

  const fetchRequests = async () => {
    const res = await axios.get(`${API_BASE}/attendance-request/manager`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRequests(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await axios.patch(
      `${API_BASE}/attendance-request/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchRequests();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB");
  
  const statusStyle = (status: string) => {
    if (status === "APPROVED")
      return "bg-green-100 text-green-700 border-green-300";

    if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-300";

    return "bg-yellow-100 text-yellow-700 border-yellow-300";
  };
  if(loading)return<Loader/>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Attendance Requests</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Punch In</th>
              <th className="p-3">Punch Out</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-medium">{r.user?.name}</td>
                <td className="p-3">{formatDate(r.date)}</td>
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.punchIn || "-"}</td>
                <td className="p-3">{r.punchOut || "-"}</td>

                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                    className={`px-2 py-1 rounded-md border text-xs font-semibold outline-none
    ${statusStyle(r.status)}
  `}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>

                <td
                  className="p-3 text-primary text-xs cursor-pointer"
                  onClick={() => setView(r)}
                >
                  View
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-gray-500">
                  No attendance requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {view && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Attendance Request Detail
            </h3>

            <div className="space-y-2 text-sm">
              <p>
                <b>Employee:</b> {view.user.name}
              </p>
              <p>
                <b>Date:</b> {formatDate(view.date)}
              </p>
              <p>
                <b>Type:</b> {view.type}
              </p>
              <p>
                <b>Punch In:</b> {view.punchIn || "-"}
              </p>
              <p>
                <b>Punch Out:</b> {view.punchOut || "-"}
              </p>
              <p>
                <b>Reason:</b> {view.reason}
              </p>
              <p>
                <b>Status:</b> {view.status}
              </p>
            </div>

            <div className="text-right mt-5">
              <button
                onClick={() => setView(null)}
                className="px-4 py-2 text-sm border rounded-md"
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

export default EmployeeAttendanceRequest;
