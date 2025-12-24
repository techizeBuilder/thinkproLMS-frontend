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

const API_BASE = import.meta.env.VITE_API_URL;

type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface User {
  _id: string;
  name: string;
  role: string;
  email:string;
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
  email:string;
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

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch users
      const usersRes = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const users: User[] = usersRes.data;

      // 2️⃣ Fetch documents for each user
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
              email:user.email,
              documents: docRes.data,
            };
          } catch {
            return {
              userId: user._id,
              name: user.name,
              role: user.role,
              email:user.email,
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
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Onboarding Checklist</h1>
        <p className="text-sm text-gray-500">
          Employee document upload & verification status
        </p>
      </div>

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Sr No.</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead>PAN</TableHead>
              <TableHead>12th or Makrsheet</TableHead>
              <TableHead>Passbook</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.userId}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-medium">{row.name}</TableCell>

                  <TableCell className="capitalize">{row.role}</TableCell>
                  <TableCell className="capitalize">{row.email}</TableCell>

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
    </div>
  );
};

export default OnboardingChecklist;
