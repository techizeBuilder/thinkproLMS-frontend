/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "../Loader";

const API_BASE = import.meta.env.VITE_API_URL;
const ViewAPI = API_BASE.replace("/api", "");

interface DocumentFile {
  _id: string;
  type: "AADHAAR" | "PAN" | "MARKSHEET_12" | "PASSBOOK";
  fileName: string;
  filePath: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
}

interface User {
  _id: string;
  name: string;
  role: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  MARKSHEET_12: "12th Marksheet",
  PASSBOOK: "Bank Passbook",
};

/* ================= STATUS BADGE ================= */

const StatusBadge = ({ status }: { status: string }) => {
  const color =
    status === "VERIFIED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${color}`}>
      {status}
    </span>
  );
};

export default function Document() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentFile[]>(
    [],
  );

  // 🔍 search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔥 pagination
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 15;

  /* ================= DEBOUNCE SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ================= FETCH USERS (BACKEND FILTER) ================= */

  const fetchUsers = async (pageNumber = 1, search = "") => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/users?page=${pageNumber}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setUsers(res.data.data);
      setTotalUsers(res.data.totalUsers);
      setPage(pageNumber);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ON PAGE / SEARCH ================= */

  useEffect(() => {
    fetchUsers(page, debouncedSearch);
  }, [page, debouncedSearch]);

  /* ================= FETCH DOCUMENTS ================= */

  const handleViewDocuments = async (userId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/documents/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedDocuments(res.data);
      setOpen(true);
    } catch {
      setSelectedDocuments([]);
      setOpen(true);
    }
  };

  /* ================= VERIFY / REJECT ================= */

  const handleVerify = async (
    documentId: string,
    status: "VERIFIED" | "REJECTED",
  ) => {
    await axios.patch(
      `${API_BASE}/documents/verify/${documentId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    setSelectedDocuments((prev) =>
      prev.map((doc) => (doc._id === documentId ? { ...doc, status } : doc)),
    );
  };

  /* ================= GROUP DOCUMENTS ================= */

  const groupedDocuments = selectedDocuments.reduce(
    (acc: Record<string, DocumentFile[]>, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    },
    {},
  );

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(totalUsers / limit);

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

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <div className="relative min-h-[300px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Uploaded Documents</h1>

      {/* ================= SEARCH ================= */}

      <input
        type="text"
        placeholder="Search by user name or role..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full sm:w-80 h-10 px-3 border rounded-md focus:ring-2 focus:ring-orange-400"
      />

      {/* ================= USER TABLE ================= */}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>User Role</TableHead>
              <TableHead>Documents</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocuments(user._id)}
                    >
                      View Documents
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
                  onClick={() => setPage(p as number)}
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

      {/* ================= DOCUMENT MODAL ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uploaded Documents</DialogTitle>
          </DialogHeader>

          {Object.keys(DOCUMENT_LABELS).map((type) => {
            const docs = groupedDocuments[type] || [];

            return (
              <div key={type} className="mb-4">
                <h3 className="font-semibold mb-2">{DOCUMENT_LABELS[type]}</h3>

                {docs.length === 0 ? (
                  <p className="text-sm text-gray-500">Not uploaded</p>
                ) : (
                  docs.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex justify-between border p-3 rounded mb-2"
                    >
                      <div>
                        <p className="text-sm">{doc.fileName}</p>
                        <StatusBadge status={doc.status} />
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`${ViewAPI}/uploads/user-documents/${doc.fileName}`}
                          target="_blank"
                        >
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </a>

                        <Button
                          size="sm"
                          disabled={doc.status !== "PENDING"}
                          onClick={() => handleVerify(doc._id, "VERIFIED")}
                        >
                          ✔
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={doc.status !== "PENDING"}
                          onClick={() => handleVerify(doc._id, "REJECTED")}
                        >
                          ✖
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </DialogContent>
      </Dialog>
    </div>
  );
}
