/** @format */
import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface AssignedUser {
  user: {
    _id: string;
    name: string;
    employeeCode: string;
  };
  quantity: number;
}

interface Asset {
  _id: string;
  assetName: string;
  assetCode: string;
  assetCategory: string;
  quantity: number;
  damagedCount: number;
  location: string;
  status: "AVAILABLE" | "ASSIGNED" | "DAMAGED" | "DISPOSED";
  assignedTo: AssignedUser[];
}

export default function AssetReturn() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /* ================= FETCH ASSIGNED ASSETS ================= */
  const fetchAssets = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/non-it-assets`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Sirf assigned assets
    const assignedAssets = res.data.filter(
      (a: Asset) => a.assignedTo?.length > 0
    );

    setAssets(assignedAssets);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  /* ================= DISPOSE HANDLER ================= */
  const handleDispose = async (
    assetId: string,
    userId: string,
    quantity: number
  ) => {
    if (!window.confirm("Are you sure you want to DISPOSE this asset?")) return;

    await axios.patch(
      `${API}/non-it-assets/${assetId}/dispose`,
      { userId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    fetchAssets();
  };

  if (loading) return <p>Loading assets...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">
        Asset Return & Verification
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Asset</th>
              <th className="p-3">Code</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset) =>
              asset.assignedTo.map((assign, idx) => (
                <tr key={asset._id + idx} className="border-t">
                  <td className="p-3 font-medium">{asset.assetName}</td>
                  <td className="p-3">{asset.assetCode}</td>

                  <td className="p-3">
                    {assign.user.name} ({assign.user.employeeCode})
                  </td>

                  <td className="p-3">{assign.quantity}</td>

                  <td className="p-3">{asset.location}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                      ASSIGNED
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="p-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value === "DISPOSED") {
                          handleDispose(
                            asset._id,
                            assign.user._id,
                            assign.quantity
                          );
                        }
                      }}
                      className="border rounded px-2 py-1 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select Action
                      </option>

                      <option value="DISPOSED" className="text-red-600">
                        Dispose Asset
                      </option>
                    </select>
                  </td>
                </tr>
              ))
            )}

            {assets.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No assigned assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
