/** @format */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 15;

type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
}

interface Document {
  type: "AADHAAR" | "PAN" | "MARKSHEET_12" | "PASSBOOK";
  status: DocStatus;
}

const REQUIRED_DOCUMENTS = [
  "AADHAAR",
  "PAN",
  "MARKSHEET_12",
  "PASSBOOK",
] as const;

type RequiredDocType = (typeof REQUIRED_DOCUMENTS)[number];

interface ChecklistRow {
  userId: string;
  name: string;
  role: string;
  email: string;
  documents: Document[];
}

const StatusBadge = ({ status }: { status: DocStatus | "NOT_UPLOADED" }) => {
  const color =
    status === "VERIFIED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
      ? "bg-red-100 text-red-700"
      : status === "PENDING"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-500";

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${color}`}>
      {status}
    </span>
  );
};

const OnboardingChecklist = () => {
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);

      const usersRes = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const users: User[] = usersRes.data;

      const checklistData: ChecklistRow[] = await Promise.all(
        users.map(async (user) => {
          try {
            const docRes = await axios.get(
              `${API_BASE}/documents/user/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            return {
              userId: user._id,
              name: user.name,
              role: user.role,
              email: user.email,
              documents: docRes.data,
            };
          } catch {
            return {
              userId: user._id,
              name: user.name,
              role: user.role,
              email: user.email,
              documents: [],
            };
          }
        })
      );

      setRows(checklistData);
    } catch (error) {
      console.error("Failed to load onboarding checklist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatus = (
    docs: Document[],
    type: RequiredDocType
  ): DocStatus | "NOT_UPLOADED" => {
    const doc = docs.find((d) => d.type === type);
    return doc ? doc.status : "NOT_UPLOADED";
  };

  const getUploadedCount = (docs: Document[]) => {
    return docs.filter((d) =>
      REQUIRED_DOCUMENTS.includes(d.type as RequiredDocType)
    ).length;
  };

  // 🔍 SEARCH FILTER
  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      `${row.name} ${row.email} ${row.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [rows, search]);

  // 📄 PAGINATION DATA
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);
    if (loading) {
      return (
        <div className="relative min-h-[300px]">
          <Loader />
        </div>
      );
    }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Onboarding Checklist</h1>
        <p className="text-sm text-gray-500">
          Employee document upload & verification status
        </p>
      </div>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-80 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr No.</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>12th Marksheet</TableHead>
              <TableHead>Passbook</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => (
                <TableRow key={row.userId}>
                  <TableCell>
                    {(page - 1) * ITEMS_PER_PAGE + index + 1}
                  </TableCell>

                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.email}</TableCell>

                  <TableCell>
                    {getUploadedCount(row.documents)} /{" "}
                    {REQUIRED_DOCUMENTS.length}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={getStatus(row.documents, "AADHAAR")} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={getStatus(row.documents, "PAN")} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      status={getStatus(row.documents, "MARKSHEET_12")}
                    />
                  </TableCell>

                  <TableCell>
                    <StatusBadge
                      status={getStatus(row.documents, "PASSBOOK")}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔢 Pagination (ONLY IF > 15) */}
      {filteredRows.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-full border transition
                ${
                  page === i + 1
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;
