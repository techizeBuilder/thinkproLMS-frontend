/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

/* ---------------- TYPES ---------------- */
type UserType = {
  _id: string;
  name: string;
  email: string;
};

type AssignmentType = {
  _id: string;
  user: UserType;
  software: string;
  licenseKey?: string;
  assignedAt: string;
  expiryDate?: string;
  status: "ACTIVE" | "REVOKED";
};

/* ---------------- MAIN PAGE ---------------- */
export default function SoftwareAndLicenseAssignment() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [open, setOpen] = useState(false);

  /* Fetch Users */
  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setUsers(res.data);
  };

  /* Fetch Assigned Software */
  const fetchAssignments = async () => {
    const res = await axios.get(`${API}/license/assigned`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setAssignments(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchAssignments();
  }, []);

  /* Revoke */
  const revokeLicense = async (id: string) => {
    await axios.patch(`${API}/license/revoke/${id}`);
    fetchAssignments();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Software & License Assignment</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Assign Software & License
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 border">Sr.No</th>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Software</th>
              <th className="p-3 border">Assigned On</th>
              <th className="p-3 border">Expiry</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {assignments.map((item, index) => (
              <tr key={item._id} className="text-sm text-center">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{item.user?.name}</td>
                <td className="p-3 border">{item.software}</td>
                <td className="p-3 border">
                  {new Date(item.assignedAt).toLocaleDateString()}
                </td>
                <td className="p-3 border">
                  {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-3 border">
                  {item.status === "ACTIVE" && (
                    <button
                      onClick={() => revokeLicense(item._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {assignments.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-gray-500">
                  No software assigned yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <AssignSoftwareModal
          users={users}
          onClose={() => setOpen(false)}
          onSuccess={fetchAssignments}
        />
      )}
    </div>
  );
}

/* ---------------- MODAL ---------------- */
function AssignSoftwareModal({
  users,
  onClose,
  onSuccess,
}: {
  users: UserType[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    userId: "",
    software: "",
    licenseKey: "",
    expiryDate: "",
    remarks: "",
  });

const handleAssign = async () => {
  try {
    await axios.post(`${API}/license/assign`, form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    onSuccess();
    onClose();
  } catch (error) {
    console.error("Assign failed", error);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Software & License</h2>
          <X className="cursor-pointer text-gray-500" onClick={onClose} />
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">User</label>
            <select
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Software Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. MS Office, Figma"
              onChange={(e) => setForm({ ...form, software: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">License Key</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
              onChange={(e) => setForm({ ...form, licenseKey: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expiry Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Optional remarks"
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
