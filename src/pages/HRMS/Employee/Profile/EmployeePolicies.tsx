/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import PolicyViewModal from "./PolicyViewModal"; 
import {
  FileText,
  ShieldCheck,
  BookOpen,
  CalendarDays,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Building2,
  Search,
} from "lucide-react";
import Loader from "../../Loader";

const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface UserType {
  _id: string;
  name: string;
  employeeId: string;
  companyId?: {
    name: string;
  };
}

interface PolicyType {
  id: string;
  title: string;
  description: string;
  type: "HR" | "LEAVE" | "IT" | "CONDUCT";
  mandatory: boolean;
  updatedAt: string;
  isRead: boolean;
  pdfUrl: string; // ✅ NEW
}


/* ================= STATIC POLICIES ================= */

const STATIC_POLICIES: PolicyType[] = [
  {
    id: "1",
    title: "HR Policy",
    description: "Company rules, employee responsibilities & ethics.",
    type: "HR",
    mandatory: true,
    updatedAt: "12 Aug 2025",
    isRead: false,
    pdfUrl: "/policies/hr-policy.pdf",
  },
  {
    id: "2",
    title: "Leave & Attendance Policy",
    description: "Leave rules, approval & attendance management.",
    type: "LEAVE",
    mandatory: true,
    updatedAt: "05 Aug 2025",
    isRead: true,
    pdfUrl: "/policies/leave-policy.pdf",
  },
  {
    id: "3",
    title: "IT & Data Security Policy",
    description: "System usage, data security & IT rules.",
    type: "IT",
    mandatory: true,
    updatedAt: "01 Aug 2025",
    isRead: false,
    pdfUrl: "/policies/it-policy.pdf",
  },
];


/* ================= HELPERS ================= */

const policyIcon = (type: string) => {
  switch (type) {
    case "HR":
      return <UsersIcon />;
    case "LEAVE":
      return <CalendarDays className="text-green-600" />;
    case "IT":
      return <ShieldCheck className="text-purple-600" />;
    case "CONDUCT":
      return <BookOpen className="text-orange-600" />;
    default:
      return <FileText />;
  }
};

const UsersIcon = () => <FileText className="text-blue-600" />;

/* ================= COMPONENT ================= */

export default function EmployeePolicies() {
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = loggedInUser?.id;

  const [user, setUser] = useState<UserType | null>(null);
  const policies: PolicyType[] = STATIC_POLICIES;
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [search, setSearch] = useState("");


  /* ================= FETCH USER ================= */

  const fetchUser = async () => {
    const res = await axios.get(`${API}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const filteredPolicies = policies.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return <Loader/>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Company Policies</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Building2 size={16} />
            <span>{user.companyId?.name || "Your Company"}</span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search policy..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* POLICIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPolicies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
          >
            {/* TOP */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {policyIcon(policy.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{policy.title}</h3>
                  {policy.mandatory && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Mandatory
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {policy.description}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {policy.updatedAt}
                </p>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2 mt-4 text-sm">
              {policy.isRead ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  Read
                </span>
              ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle size={16} />
                  Unread
                </span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedPolicy(policy)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                <Eye size={16} />
                View
              </button>

              <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredPolicies.length === 0 && (
        <div className="text-center text-gray-500 py-10">No policies found</div>
      )}

      {selectedPolicy && (
        <PolicyViewModal
          policy={selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </div>
  );
}
