/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

export default function FinanceTravelRequest() {
  const [requests, setRequests] = useState<any[]>([]);
  const [viewData, setViewData] = useState<any>(null);
  const [loading,setLoading]=useState(true);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    const res = await axios.get(`${API_BASE}/travel-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setRequests(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await axios.patch(
      `${API_BASE}/travel-requests/manager/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchRequests();
  };

  const statusColor = (status: string) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };
  if(loading)return<Loader/>;
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Travel Requests</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Destination</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3 font-medium">{r.employee?.name}</td>
                <td className="p-3">{r.purpose}</td>
                <td className="p-3">{r.destination}</td>
                <td className="p-3">
                  {new Date(r.fromDate).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {new Date(r.toDate).toLocaleDateString()}
                </td>
                <td className="p-3 font-semibold">₹{r.budget}</td>

                {/* STATUS DROPDOWN */}
                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r._id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                      r.status
                    )}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>

                {/* VIEW */}
                <td className="p-3 text-blue-600 cursor-pointer text-sm">
                  <span onClick={() => setViewData(r)}>View</span>
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-gray-500">
                  No travel requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {viewData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4">
              Travel Request Details
            </h3>

            <div className="space-y-2 text-sm">
              <p>
                <b>Employee:</b> {viewData.employee?.name}
              </p>
              <p>
                <b>Purpose:</b> {viewData.purpose}
              </p>
              <p>
                <b>Destination:</b> {viewData.destination}
              </p>
              <p>
                <b>From:</b> {new Date(viewData.fromDate).toLocaleDateString()}
              </p>
              <p>
                <b>To:</b> {new Date(viewData.toDate).toLocaleDateString()}
              </p>
              <p>
                <b>Budget:</b> ₹{viewData.budget}
              </p>
              <p>
                <b>Remarks:</b> {viewData.remarks || "-"}
              </p>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setViewData(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
