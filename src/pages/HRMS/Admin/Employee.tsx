/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);


  useEffect(() => {
    fetchEmployees(1);
  }, []);

const fetchEmployees = async (pageNumber = 1) => {
  try {
    const token = localStorage.getItem("token");
    setLoading(true);

    const res = await axios.get(`${API_BASE}/users?page=${pageNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setEmployees(res.data.data); // 👈 backend se data
    setTotalPages(res.data.totalPages || 1);
    setTotalUsers(res.data.totalUsers);
    setPage(pageNumber);
    setLoading(false);
  } catch (err) {
    console.error("Failed to fetch employees", err);
    setLoading(false);
  }
};


  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // UI se turant remove
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

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

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (page < totalPages - 2) pages.push("...");

  pages.push(totalPages);

  return pages;
};


   if (loading) {
     return (
       <div className="relative min-h-screen">
         <Loader/>
       </div>
     );
   }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Employee</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard / Employee</p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-sm">
        <input
          type="text"
          placeholder="Search by Employee ID or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
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
      {/* Stylish Pagination */}
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
                  onClick={() => fetchEmployees(p as number)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all duration-200
              ${
                page === p
                  ? "bg-orange-500 text-white shadow-lg scale-105"
                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
              }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
