/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import DesignationModal from "./DesignationModal";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Designation() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "view" | "edit">("add");
  const [selected, setSelected] = useState<any>(null);

  const fetchData = async () => {
    const res = await axios.get(`${API_BASE}/designations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this designation?")) return;
    await axios.delete(`${API_BASE}/designations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Designation</h1>
          <p className="text-sm text-gray-500">
            System Configuration / Designation
          </p>
        </div>
        <button
          onClick={() => {
            setMode("add");
            setSelected(null);
            setOpenModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          + Add Designation
        </button>
      </div>

      <div className="bg-white rounded shadow">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th>Department</th>
              <th>Company</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d._id} className="border-t">
                <td className="p-3">{d.name}</td>
                <td>{d.departmentId?.name}</td>
                <td>{d.companyId?.name}</td>
                <td>
                  {" "}
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      d.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="text-center relative">
                  <MoreVertical
                    className="inline cursor-pointer"
                    onClick={() =>
                      setOpenMenu(openMenu === d._id ? null : d._id)
                    }
                  />
                  {openMenu === d._id && (
                    <div className="absolute right-4 bg-white border rounded shadow">
                      <button
                        className="block px-4 py-2 w-full text-left"
                        onClick={() => {
                          setMode("view");
                          setSelected(d);
                          setOpenModal(true);
                          setOpenMenu(null);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="block px-4 py-2 w-full text-left"
                        onClick={() => {
                          setMode("edit");
                          setSelected(d);
                          setOpenModal(true);
                          setOpenMenu(null);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="block px-4 py-2 w-full text-left text-red-500"
                        onClick={() => deleteItem(d._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DesignationModal
        isOpen={openModal}
        mode={mode}
        designation={selected}
        onClose={() => {
          setOpenModal(false);
          fetchData();
        }}
      />
    </div>
  );
}
