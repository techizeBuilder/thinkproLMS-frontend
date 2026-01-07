/** @format */

import axios from "axios";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "MANAGER" | "ADMIN";
  department: string;
  departmentId: { _id: string; name: string };
  designation: string;
  status: "ACTIVE" | "LOCKED" | "DISABLED";
  createdAt: string;
}

interface Props {
  user: UserType;
  mode: "view" | "edit";
  onClose: () => void;
  onUpdated: () => void;
}


export default function AccountViewModal({ user, mode, onClose, onUpdated }: Props) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [department, setDepartment] = useState(user.departmentId?.name);
  const [status, setStatus] = useState(user.status);

  const handleUpdate = async () => {
    await axios.patch(
      `${API}/users/${user._id}`,
      { email, role, department, status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4">
          {mode === "view" ? "User Details" : "Edit User"}
        </h2>

        <div className="space-y-3 text-sm">
          <div>
            <label className="font-medium">Name</label>
            <input
              disabled
              value={user.name}
              className="w-full border p-2 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              disabled={mode === "view"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Role</label>
            <select
              disabled={mode === "view"}
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border p-2 rounded"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR">HR</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="font-medium">Department</label>
            <input
              disabled={mode === "view"}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="font-medium">Account Status</label>
            <select
              disabled={mode === "view"}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border p-2 rounded"
            >
              <option value="ACTIVE">Active</option>
              <option value="LOCKED">Locked</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Close
          </button>

          {mode === "edit" && (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
