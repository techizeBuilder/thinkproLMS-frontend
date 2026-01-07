/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

/* ---------------- TYPES ---------------- */
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Asset {
  _id: string;
  assetType: string;
  serialNumber: string;
  status: "AVAILABLE" | "ASSIGNED";
  assignedTo?: User | null;
}

/* ---------------- COMPONENT ---------------- */
export default function AssignReassignAsset() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  const fetchAssets = async () => {
    const res = await axios.get(`${API}/asset`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setAssets(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setUsers(res.data);
  };

  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);

  /* ---------------- ASSIGN / RE-ASSIGN ---------------- */
  const handleAssign = async () => {
    if (!selectedAsset || !employeeId) return;

    await axios.patch(
      `${API}/asset/${selectedAsset._id}/assign`,
      { employeeId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setOpen(false);
    setEmployeeId("");
    setSelectedAsset(null);
    fetchAssets();
  };

  /* ---------------- UNASSIGN (OPTIONAL) ---------------- */
  const handleUnassign = async (assetId: string) => {
    await axios.patch(
      `${API}/asset/${assetId}/unassign`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    fetchAssets();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Asset Assignment</h1>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left">Sr.No</th>
              <th className="p-4 text-left">Asset</th>
              <th className="p-4 text-left">Serial Number</th>
              <th className="p-4 text-left">Assigned To</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset, i) => (
              <tr key={asset._id} className="border-t text-sm hover:bg-gray-50">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{asset.assetType}</td>
                <td className="p-4 font-medium">{asset.serialNumber}</td>
                <td className="p-4">
                  {asset.assignedTo ? asset.assignedTo.name : "—"}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      asset.status === "AVAILABLE"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {asset.status}
                  </span>
                </td>

                {/* ACTION */}
                <td className="p-4 relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === asset._id ? null : asset._id)
                    }
                    className="p-2 rounded hover:bg-gray-100"
                  >
                    <MoreVertical />
                  </button>

                  {openMenuId === asset._id && (
                    <div className="absolute right-4 top-12 w-40 bg-white border rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {asset.status === "AVAILABLE" ? "Assign" : "Re-Assign"}
                      </button>

                      {asset.status === "ASSIGNED" && (
                        <button
                          onClick={() => {
                            handleUnassign(asset._id);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Unassign
                        </button>
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
      {open && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {selectedAsset.status === "AVAILABLE"
                ? "Assign Asset"
                : "Re-Assign Asset"}
            </h2>

            {/* FORM */}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset</label>
                <input
                  disabled
                  value={`${selectedAsset.assetType} (${selectedAsset.serialNumber})`}
                  className="w-full border p-2 rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Assign To
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Employee</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!employeeId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {selectedAsset.status === "AVAILABLE"
                  ? "Assign Asset"
                  : "Re-Assign Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
