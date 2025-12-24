/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import AddSalaryStructureModal from "./AddSalaryStructureModal";
import DeleteSalaryStructureModal from "./DeleteSalaryStructureModal";


interface Employee {
  _id: string;
  name: string;
}

interface SalaryStructure {
  _id: string;
  employee: Employee;
  basic: number;
  hra: number;
  allowance: number;
  pf: number;
  tax: number;
}

const API_BASE = import.meta.env.VITE_API_URL;

const SalaryStructure = () => {
  const token = localStorage.getItem("token");

  const [salaryList, setSalaryList] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(false);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryStructure | null>(
    null
  );

  /* ================= FETCH ================= */
  const fetchSalary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/salary-structures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalaryList(res.data);
    } catch {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedSalary) return;

    try {
      await axios.delete(
        `${API_BASE}/salary-structures/${selectedSalary._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDeleteModal(false);
      setSelectedSalary(null);
      fetchSalary();
    } catch {
      alert("Delete failed");
    }
  };

  const netSalary = (s: SalaryStructure) =>
    s.basic + s.hra + s.allowance - (s.pf + s.tax);

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Salary Structure</h1>
          <p className="text-sm text-gray-500">
            HR / Payroll / Salary Structure
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSalary(null);
            setOpenAddModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600"
        >
          + Add Salary Structure
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Basic</th>
              <th className="px-4 py-3">HRA</th>
              <th className="px-4 py-3">Allowance</th>
              <th className="px-4 py-3">PF</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3">Net Salary</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && salaryList.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  No salary structure found
                </td>
              </tr>
            )}

            {!loading &&
              salaryList.map((s, index) => (
                <tr key={s._id} className="border-t text-sm">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-orange-500">
                    {s.employee?.name}
                  </td>
                  <td className="px-4 py-3">₹{s.basic}</td>
                  <td className="px-4 py-3">₹{s.hra}</td>
                  <td className="px-4 py-3">₹{s.allowance}</td>
                  <td className="px-4 py-3">₹{s.pf}</td>
                  <td className="px-4 py-3">₹{s.tax}</td>
                  <td className="px-4 py-3 font-semibold">₹{netSalary(s)}</td>

                  {/* ACTION */}
                  <td className="px-4 py-3 text-center relative">
                    <span
                      className="cursor-pointer inline-block"
                      onClick={() =>
                        setOpenMenu(openMenu === s._id ? null : s._id)
                      }
                    >
                      <MoreVertical size={18} />
                    </span>

                    {openMenu === s._id && (
                      <div className="absolute right-6 mt-2 w-36 bg-white border rounded-md shadow-lg z-50">
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => {
                            setOpenMenu(null);
                            setSelectedSalary(s);
                            setOpenAddModal(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setOpenMenu(null);
                            setSelectedSalary(s);
                            setOpenDeleteModal(true);
                          }}
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

      {/* ADD / EDIT */}
      <AddSalaryStructureModal
        isOpen={openAddModal}
        editData={selectedSalary}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedSalary(null);
          fetchSalary();
        }}
      />

      {/* DELETE */}
      <DeleteSalaryStructureModal
        isOpen={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setSelectedSalary(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default SalaryStructure;
