/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

interface Employee {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
}

export default function Employee() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // 🔑 URL state
  const page = Number(searchParams.get("page")) || 1;
  const urlSearch = searchParams.get("search") || "";

  // 🔑 INPUT state (typing ke liye)
  const [searchInput, setSearchInput] = useState(urlSearch);

  // 🔑 DEBOUNCED search (API call ke liye)
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // 🔄 URL → input sync (back / reload case)
  useEffect(() => {
    setSearchInput(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // ⏳ DEBOUNCE logic (LIVE FILTER)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 🔄 URL update AFTER debounce
  useEffect(() => {
    setSearchParams({
      page: "1",
      search: debouncedSearch,
    });
  }, [debouncedSearch, setSearchParams]);

  // 🔄 API CALL
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/users?page=${page}&search=${debouncedSearch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setEmployees(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || 0);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setLoading(false);
    }
  };

  // 🔁 FETCH on page / search change
  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch]);

  // 📄 Pagination click
  const handlePageChange = (p: number) => {
    setSearchParams({
      page: p.toString(),
      search: debouncedSearch,
    });
  };

  // ❌ Delete
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  // 📄 Pagination UI logic
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Employee</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard / Employee</p>
      </div>

      {/* 🔍 LIVE SEARCH (NO BUTTON) */}
      <div className="mb-8 max-w-sm">
        <input
          type="text"
          placeholder="Search by Employee ID or Name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Loader (NON-BLOCKING) */}
      {loading && (
        <div className="mb-6">
          <Loader />
        </div>
      )}

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {employees.map((emp) => (
          <div
            key={emp._id}
            className="bg-white rounded-xl shadow-sm p-6 relative"
          >
            {/* 3 dots */}
            <div className="absolute top-4 right-4">
              <div
                className="text-blue-500 cursor-pointer"
                onClick={() =>
                  setOpenMenu(openMenu === emp._id ? null : emp._id)
                }
              >
                <MoreVertical size={18} />
              </div>

              {openMenu === emp._id && (
                <div className="absolute right-0 mt-2 w-20 bg-white border rounded-lg shadow-md z-50">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setOpenMenu(null);
                      navigate(`/hrms/SuperAdmin/employees/profile/${emp._id}`);
                    }}
                  >
                    View
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setOpenMenu(null);
                      alert(`Edit ${emp.name}`);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    onClick={() => {
                      setOpenMenu(null);
                      if (
                        confirm(`Are you sure you want to delete ${emp.name}?`)
                      ) {
                        handleDelete(emp._id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex justify-center mb-4">
              {emp.avatar ? (
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">👤</span>
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="text-center text-orange-500 font-semibold text-lg">
              {emp.name}
            </h3>

            {/* Role */}
            <p className="text-center text-gray-500 text-sm mt-1">{emp.role}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalUsers > 15 && totalPages > 1 && (
        <div className="flex justify-end mt-12">
          <div className="flex items-center gap-2 bg-white shadow-md rounded-xl px-4 py-3">
            {getPaginationPages().map((p, index) =>
              p === "..." ? (
                <span key={index} className="px-3 py-2 text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    page === p
                      ? "bg-orange-500 text-white shadow-lg scale-105"
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
    </div>
  );
}
