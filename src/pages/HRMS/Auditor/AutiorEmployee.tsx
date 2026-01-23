/** @format */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../Loader";

interface CommonRef {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  employmentType?: string;
  employmentStatus?: string;
  profilePicture?: string | null;
  departmentId?: CommonRef;
  designationId?: CommonRef;
  managerId?: CommonRef;
}

const API_BASE = import.meta.env.VITE_API_URL;

export default function AutiorEmployee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH EMPLOYEES ================= */
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params: any = { page };
      if (search.trim()) params.search = debouncedSearch;

      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // ✅ SAFELY HANDLE BOTH CASES
      if (Array.isArray(res.data?.data)) {
        setEmployees(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
        setTotalPages(1);
      } else {
        setEmployees([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // new search → page reset
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);


  /* ================= INITIALS ================= */
  const getInitials = (name: string) => {
    const words = name.split(" ");
    return words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0][0];
  };
  if(loading)return<Loader/>;
  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-16">
        <h1 className="text-3xl font-bold text-slate-800">
          👥 Employee Records
        </h1>

        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // 🔴 reset page on search
          }}
          className="w-full md:w-80 px-4 py-2 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm"
        />
      </div>

      {/* Loader */}
      {loading && (
        <div className="text-center text-slate-500 mt-20">
          Loading employees...
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="relative rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 p-5"
              >
                {/* Status */}
                <span
                  className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full
                  ${
                    emp.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {emp.status || "ACTIVE"}
                </span>

                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xl font-semibold mb-3">
                  {emp.profilePicture ? (
                    <img
                      src={emp.profilePicture}
                      alt={emp.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(emp.name)
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-slate-800">
                  {emp.name}
                </h3>

                <p className="text-sm text-slate-500 truncate mb-3">
                  {emp.email}
                </p>

                {/* Info */}
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Role:</span> {emp.role}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{" "}
                    {emp.employmentType || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Department:</span>{" "}
                    {emp.departmentId?.name || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Manager:</span>{" "}
                    {emp.managerId?.name || "N/A"}
                  </p>
                </div>
              </div>
            ))}

            {employees.length === 0 && (
              <p className="col-span-full text-center text-slate-500">
                No employees found
              </p>
            )}
          </div>

          {/* 🔴 PAGINATION (ONLY WHEN > 15 USERS) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg bg-white shadow disabled:opacity-50"
              >
                Prev
              </button>

              <span className="font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg bg-white shadow disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
