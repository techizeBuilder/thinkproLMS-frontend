/** @format */

import React, { useEffect, useState } from "react";
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

const API_BASE = import.meta.env.VITE_API_URL;

interface DocumentFile {
  _id: string;
  type: "AADHAAR" | "PAN" | "MARKSHEET_12" | "PASSBOOK";
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
}

const DOCUMENT_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  MARKSHEET_12: "12th Marksheet",
  PASSBOOK: "Bank Passbook",
};



interface User {
  _id: string;
  name: string;
  role: string;
}

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

const Document = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentFile[]>(
    []
  );
  const [search, setSearch] = useState("");

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FETCH DOCUMENTS BY USER ================= */

  const handleViewDocuments = async (userId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/documents/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedDocuments(res.data);
      setOpen(true);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      setSelectedDocuments([]);
      setOpen(true);
    }
  };

  /* ================= VERIFY / REJECT ================= */

  const handleVerify = async (
    documentId: string,
    status: "VERIFIED" | "REJECTED"
  ) => {
    try {
      await axios.patch(
        `${API_BASE}/documents/verify/${documentId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 🔥 Update UI without refetch
      setSelectedDocuments((prev) =>
        prev.map((doc) => (doc._id === documentId ? { ...doc, status } : doc))
      );
    } catch (err) {
      alert("Failed to update document status");
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q)
    );
  });
const groupedDocuments = selectedDocuments.reduce(
  (acc: Record<string, DocumentFile[]>, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  },
  {}
);


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Uploaded Documents</h1>

      <input
        type="text"
        placeholder="Search by user name or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full sm:w-80 h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Sr. No.</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>User Role</TableHead>
              <TableHead>Documents</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
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

      {/* ================= DOCUMENT MODAL ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uploaded Documents</DialogTitle>
          </DialogHeader>

          {selectedDocuments.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          ) : (
            <div className="space-y-6">
              {Object.keys(DOCUMENT_LABELS).map((type) => {
                const docs = groupedDocuments[type] || [];

                return (
                  <div key={type}>
                    <h3 className="font-semibold mb-2">
                      {DOCUMENT_LABELS[type]}
                    </h3>

                    {docs.length === 0 ? (
                      <p className="text-sm text-gray-500">Not uploaded</p>
                    ) : (
                      docs.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between border p-3 rounded mb-2"
                        >
                          <div className="space-y-1">
                            <p className="text-sm truncate">{doc.fileName}</p>
                            <StatusBadge status={doc.status} />
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={`http://localhost:8000/uploads/user-documents/${doc.fileName}`}
                              target="_blank"
                              rel="noopener noreferrer"
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Document;
