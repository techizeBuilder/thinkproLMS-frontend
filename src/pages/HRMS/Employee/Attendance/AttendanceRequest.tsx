/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Eye, Edit, Trash2,MoreVertical } from "lucide-react";
import AttendanceRequestModal from "./AttendanceRequestModel";

const API = import.meta.env.VITE_API_URL;

export default function AttendanceRequest() {
  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: API,
    headers: { Authorization: `Bearer ${token}` },
  });

  const [requests, setRequests] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<any>("ADD");
  const [form, setForm] = useState<any>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);


  const fetchRequests = async () => {
    const res = await api.get("/attendance-request/me");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openModal = (type: any, data?: any) => {
    setMode(type);
    setSelectedId(data?._id || null);
    setForm(data || {});
    setOpen(true);
  };

  const submit = async () => {
    if (mode === "ADD") {
      await api.post("/attendance-request", form);
    } else if (mode === "EDIT") {
      await api.put(`/attendance-request/${selectedId}`, form);
    } else if (mode === "DELETE") {
      await api.delete(`/attendance-request/${selectedId}`);
    }
    setOpen(false);
    fetchRequests();
  };

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attendance Requests</h1>

        <button
          onClick={() => openModal("ADD")}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex gap-2"
        >
          <Plus size={16} /> Add Request
        </button>
      </div>

      {/* TABLE */}
      {/* TABLE */}
      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Request Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-gray-500">
                  No attendance requests found
                </td>
              </tr>
            )}

            {requests.map((r, i) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-3">{i + 1}</td>

                <td className="px-4 py-3">
                  {new Date(r.date).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 font-medium">{r.type}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      r.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-4 py-3 text-center relative">
                  <span
                    className="cursor-pointer inline-block"
                    onClick={() =>
                      setOpenMenu(openMenu === r._id ? null : r._id)
                    }
                  >
                    <MoreVertical size={18} />
                  </span>

                  {openMenu === r._id && (
                    <div className="absolute right-6 mt-2 w-36 bg-white border rounded-md shadow z-50 text-left">
                      <button
                        className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2 items-center"
                        onClick={() => {
                          openModal("VIEW", r);
                          setOpenMenu(null);
                        }}
                      >
                        <Eye size={14} /> View
                      </button>

                      {r.status === "PENDING" && (
                        <>
                          <button
                            className="w-full px-4 py-2 hover:bg-gray-100 flex gap-2 items-center"
                            onClick={() => {
                              openModal("EDIT", r);
                              setOpenMenu(null);
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>

                          <button
                            className="w-full px-4 py-2 text-red-500 hover:bg-red-50 flex gap-2 items-center"
                            onClick={() => {
                              openModal("DELETE", r);
                              setOpenMenu(null);
                            }}
                          >
                            <Trash2 size={14} /> Delete
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

      {/* MODAL */}
      <AttendanceRequestModal
        open={open}
        mode={mode}
        form={form}
        setForm={setForm}
        onClose={() => setOpen(false)}
        onSubmit={submit}
      />
    </div>
  );
}
