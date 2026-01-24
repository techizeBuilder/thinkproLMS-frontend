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
import { useSearchParams } from "react-router-dom";
import Loader from "../Loader";
import { toast } from "../Alert/Toast";
const API = import.meta.env.VITE_API_URL;

export default function ProbationConfirmation() {
  const token = localStorage.getItem("token");

  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<any[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔍 URL params
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";

  // 🔍 local input (typing)
  const [searchInput, setSearchInput] = useState(search);

  // 🔥 pagination
  const limit = 15;
  const [totalUsers, setTotalUsers] = useState(0);
  const totalPages = Math.ceil(totalUsers / limit);

  /* ================= SYNC INPUT ================= */

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams({
        page: "1",
        search: searchInput.trim(),
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ================= FETCH PROBATION USERS ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/users?page=${page}&search=${search}&employmentStatus=PROBATION`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setData(res.data.data);
      setTotalUsers(res.data.totalUsers || 0);
    } catch (err) {
      console.error("Failed to fetch probation users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  /* ================= STATUS CHANGE ================= */

const changeStatus = async (id: string, status: string) => {
  try {
    const res = await axios.patch(
      `${API}/users/${id}`,
      {
        employmentStatus: status,
        confirmationDate: status === "CONFIRMED" ? new Date() : null,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    toast({
      type: "success",
      title: "Status Updated",
      message:
        res.data?.message || `User status has been updated to ${status}.`,
    });

    fetchData();
  } catch (error: any) {
    toast({
      type: "error",
      title: "Update Failed",
      message:
        error?.response?.data?.message ||
        "Unable to update user status. Please try again.",
    });
  }
};




  /* ================= VIEW ================= */

  const handleView = (user: any) => {
    setSelected(user);
    setOpen(true);
    setMenu(null);
  };

  /* ================= PAGINATION ================= */

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">Probation & Confirmation</h2>

      {/* ================= SEARCH ================= */}

      <input
        type="text"
        placeholder="Search employee, department, manager..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full sm:w-80 h-10 px-3 border rounded-md focus:ring-2 focus:ring-orange-400"
      />

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
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-gray-500">
                  No probation users found
                </td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td>{u.designationId?.name}</td>
                  <td>{u.departmentId?.name}</td>
                  <td>{new Date(u.joiningDate).toDateString()}</td>
                  <td>{new Date(u.probationEndDate).toDateString()}</td>
                  <td>{u.managerId?.name || "-"}</td>

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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}

      {totalUsers > limit && (
        <div className="flex justify-end">
          <div className="flex gap-2 bg-white shadow-md rounded-xl px-4 py-3">
            {getPaginationPages().map((p, i) =>
              p === "..." ? (
                <span key={i} className="px-3 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() =>
                    setSearchParams({ page: p.toString(), search })
                  }
                  className={`min-w-[38px] h-9 rounded-md text-sm font-medium
                    ${
                      page === p
                        ? "bg-orange-500 text-white"
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Probation Review Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm">
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
