/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const API = import.meta.env.VITE_API_URL;

export default function ProbationConfirmation() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState<any[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  /* ================= FETCH PROBATION USERS ================= */

  const fetchData = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const probationUsers = res.data.filter(
      (u: any) => u.employmentStatus === "PROBATION"
    );

    setData(probationUsers);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= STATUS CHANGE ================= */

 const changeStatus = async (id: string, status: string) => {
   await axios.patch(
     `${API}/users/${id}`,
     {
       employmentStatus: status,
       confirmationDate: status === "CONFIRMED" ? new Date() : null,
     },
     {
       headers: { Authorization: `Bearer ${token}` },
     }
   );

   fetchData();
 };


  /* ================= VIEW ================= */

  const handleView = (user: any) => {
    setSelected(user);
    setOpen(true);
    setMenu(null);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Probation & Confirmation</h2>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Employee</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Joining Date</th>
              <th>Probation End</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="p-3 font-medium">{u.name}</td>
                <td>{u.designationId?.name}</td>
                <td>{u.departmentId?.name}</td>
                <td>{new Date(u.joiningDate).toDateString()}</td>
                <td>{new Date(u.probationEndDate).toDateString()}</td>
                <td>{u.managerId?.name || "-"}</td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    value={u.employmentStatus}
                    onChange={(e) => changeStatus(u._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="PROBATION">Probation</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </td>

                {/* ACTION */}
                <td className="relative">
                  <MoreVertical
                    className="cursor-pointer mx-auto"
                    onClick={() => setMenu(menu === u._id ? null : u._id)}
                  />

                  {menu === u._id && (
                    <div className="absolute right-0 bg-white border rounded shadow z-10">
                      <button
                        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                        onClick={() => handleView(u)}
                      >
                        View
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Probation Review Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
              {/* EMPLOYEE INFO */}
              <div>
                <h3 className="font-semibold text-gray-700">
                  Employee Details
                </h3>
                <p>
                  <b>Name:</b> {selected.name}
                </p>
                <p>
                  <b>Designation:</b> {selected.designationId?.name}
                </p>
                <p>
                  <b>Department:</b> {selected.departmentId?.name}
                </p>
                <p>
                  <b>Joining Date:</b>{" "}
                  {new Date(selected.joiningDate).toDateString()}
                </p>
                <p>
                  <b>Probation End:</b>{" "}
                  {new Date(selected.probationEndDate).toDateString()}
                </p>
              </div>

              {/* MANAGER RECOMMENDATION (STATIC) */}
              <div className="border-t pt-3">
                <h3 className="font-semibold text-gray-700">
                  Manager Recommendation
                </h3>

                <p>
                  <b>Recommendation:</b>{" "}
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    CONFIRM
                  </span>
                </p>

                <p>
                  <b>Manager Comment:</b> Performance is satisfactory and goals
                  are met.
                </p>
              </div>

              {/* HR ACTION */}
              <div className="border-t pt-3">
                <h3 className="font-semibold text-gray-700">HR Action</h3>

                <p>
                  <b>Current Status:</b>{" "}
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
                    {selected.employmentStatus}
                  </span>
                </p>
              </div>

              <div className="flex justify-end pt-3">
                <Button onClick={() => setOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
