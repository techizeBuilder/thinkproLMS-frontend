/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Eye, X, MoreVertical, Pencil, Trash } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

/* ---------------- TYPES ---------------- */
interface Asset {
  _id: string;
  assetType: string;
  serialNumber: string;
  warrantyExpiry: string;
  accessories: string[];
  status: "AVAILABLE" | "ASSIGNED";
}

/* ---------------- COMPONENT ---------------- */
export default function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [open, setOpen] = useState(false);
  const [viewAsset, setViewAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  /* form */
  const [form, setForm] = useState({
    assetType: "Laptop",
    serialNumber: "",
    warrantyExpiry: "",
    accessories: "",
    status: "AVAILABLE",
  });

  /* ---------------- FETCH ASSETS ---------------- */
  const fetchAssets = async () => {
    const res = await axios.get(`${API}/asset`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setAssets(res.data);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  /* ---------------- SAVE ASSET ---------------- */
  const handleSave = async () => {
    await axios.post(
      `${API}/asset`,
      {
        ...form,
        accessories: form.accessories.split(",").map((a) => a.trim()),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setOpen(false);
    fetchAssets();
  };

  /* ---------------- UPDATE ASSET ---------------- */
  const handleUpdate = async () => {
    if (!editAsset) return;

    await axios.patch(
      `${API}/asset/${editAsset._id}`,
      {
        ...form,
        accessories: form.accessories.split(",").map((a) => a.trim()),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setEditAsset(null);
    setOpen(false);
    fetchAssets();
  };

  /* ---------------- DELETE ASSET ---------------- */
  const handleDelete = async () => {
    if (!deleteAsset) return;

    await axios.delete(`${API}/asset/${deleteAsset._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setDeleteAsset(null);
    fetchAssets();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asset Inventory</h1>

        <button
          onClick={() => {
            setViewAsset(null);
            setEditAsset(null);
            setForm({
              assetType: "Laptop",
              serialNumber: "",
              warrantyExpiry: "",
              accessories: "",
              status: "AVAILABLE",
            });
            setOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-4 text-left">Sr.No</th>
              <th className="p-4 text-left">Asset</th>
              <th className="p-4 text-left">Serial Number</th>
              <th className="p-4 text-left">Warranty Expiry</th>
              <th className="p-4 text-left">Accessories</th>
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
                  {new Date(asset.warrantyExpiry).toLocaleDateString()}
                </td>
                <td className="p-4">{asset.accessories.join(", ")}</td>
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
                      setMenuOpen(menuOpen === asset._id ? null : asset._id)
                    }
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpen === asset._id && (
                    <div className="absolute right-4 top-10 bg-white border rounded-lg shadow w-32 z-10">
                      <button
                        onClick={() => {
                          setViewAsset(asset);
                          setEditAsset(null);
                          setOpen(true);
                          setMenuOpen(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full"
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        onClick={() => {
                          setEditAsset(asset);
                          setViewAsset(null);
                          setForm({
                            assetType: asset.assetType,
                            serialNumber: asset.serialNumber,
                            warrantyExpiry: asset.warrantyExpiry.split("T")[0],
                            accessories: asset.accessories.join(", "),
                            status: asset.status,
                          });
                          setOpen(true);
                          setMenuOpen(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full"
                      >
                        <Pencil size={14} /> Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteAsset(asset);
                          setMenuOpen(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 w-full"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / VIEW / EDIT MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {viewAsset
                ? "View Asset"
                : editAsset
                ? "Edit Asset"
                : "Add Asset"}
            </h2>

            {/* FORM */}
            <div className="grid grid-cols-1 gap-4">
              {/* SERIAL NUMBER */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Serial Number
                </label>
                <input
                  disabled={!!viewAsset}
                  value={viewAsset?.serialNumber || form.serialNumber}
                  onChange={(e) =>
                    setForm({ ...form, serialNumber: e.target.value })
                  }
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* WARRANTY EXPIRY */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Warranty Expiry
                </label>
                <input
                  type="date"
                  disabled={!!viewAsset}
                  value={
                    viewAsset
                      ? viewAsset.warrantyExpiry.split("T")[0]
                      : form.warrantyExpiry
                  }
                  onChange={(e) =>
                    setForm({ ...form, warrantyExpiry: e.target.value })
                  }
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* ACCESSORIES */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Accessories
                </label>
                <input
                  disabled={!!viewAsset}
                  value={
                    viewAsset
                      ? viewAsset.accessories.join(", ")
                      : form.accessories
                  }
                  onChange={(e) =>
                    setForm({ ...form, accessories: e.target.value })
                  }
                  placeholder="Mouse, Charger, Bag"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Asset Status
                </label>
                <select
                  disabled={!!viewAsset}
                  value={viewAsset?.status || form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {!viewAsset && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="border px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={editAsset ? handleUpdate : handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  {editAsset ? "Update Asset" : "Save Asset"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Delete Asset</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this asset?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteAsset(null)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
