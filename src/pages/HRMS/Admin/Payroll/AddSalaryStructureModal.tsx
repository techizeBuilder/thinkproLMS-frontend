/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "../../Alert/Toast";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData: any | null;
}

interface Employee {
  _id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const AddSalaryStructureModal = ({ isOpen, onClose, editData }: Props) => {
  const token = localStorage.getItem("token");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState("");
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [pf, setPf] = useState(0);
  const [tax, setTax] = useState(0);

  /* PREFILL */
  useEffect(() => {
    if (editData) {
      setEmployee(editData.employee?._id);
      setBasic(editData.basic);
      setHra(editData.hra);
      setAllowance(editData.allowance);
      setPf(editData.pf);
      setTax(editData.tax);
    } else {
      setEmployee("");
      setBasic(0);
      setHra(0);
      setAllowance(0);
      setPf(0);
      setTax(0);
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    axios
      .get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEmployees(res.data));
  }, [isOpen]);

  if (!isOpen) return null;

const handleSubmit = async () => {
  try {
    const payload = { employee, basic, hra, allowance, pf, tax };

    let res;

    if (editData) {
      res = await axios.put(
        `${API_BASE}/salary-structures/${editData._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast({
        type: "success",
        title: "Salary Updated",
        message: res.data?.message || "Salary structure updated successfully.",
      });
    } else {
      res = await axios.post(`${API_BASE}/salary-structures`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        type: "success",
        title: "Salary Added",
        message: res.data?.message || "Salary structure added successfully.",
      });
    }

    onClose();
  } catch (error: any) {
    toast({
      type: "error",
      title: "Save Failed",
      message:
        error?.response?.data?.message ||
        "Unable to save salary structure. Please try again.",
    });
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editData ? "Edit Salary Structure" : "Add Salary Structure"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Employee</label>
            <select
              className="w-full border px-3 py-2 rounded mt-1"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {[
            ["Basic Salary", basic, setBasic],
            ["HRA", hra, setHra],
            ["Allowance", allowance, setAllowance],
            ["PF", pf, setPf],
            ["Tax", tax, setTax],
          ].map(([label, val, setVal]: any, i) => (
            <div key={i}>
              <label className="text-sm font-medium">{label}</label>
              <input
                type="number"
                className="w-full border px-3 py-2 rounded mt-1"
                value={val}
                onChange={(e) => setVal(+e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            {editData ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSalaryStructureModal;
