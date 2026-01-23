/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import AccountViewModal from "./AccountViewModal";
import Loader from "../Loader";

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

export default function AccountManagement() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loading,setLoading]=useState(true);

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  if(loading)return<Loader/>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead className="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th className="p-3 border">Sr.No</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Department</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="text-sm">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{user.name}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border">{user.role}</td>
                <td className="p-3 border">{user.departmentId?.name}</td>
                <td className="p-3 border">{user.status}</td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setMode("view");
                      }}
                      className="px-3 py-1 text-xs rounded bg-gray-600 text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setMode("edit");
                      }}
                      className="px-3 py-1 text-xs rounded bg-blue-600 text-white"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <AccountViewModal
          user={selectedUser}
          mode={mode}
          onClose={() => setSelectedUser(null)}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
