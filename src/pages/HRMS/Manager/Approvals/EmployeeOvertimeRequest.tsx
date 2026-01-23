/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  role: string;
}

interface OvertimeRequest {
  _id: string;
  employee: User;
  date: string;
  hours: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const EmployeeOvertimeRequests = () => {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [selected, setSelected] = useState<OvertimeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH TEAM OVERTIME REQUESTS ================= */
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/overtime/team-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setActionLoading(true);

      await axios.patch(
        `${API_BASE}/overtime/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchRequests();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Team Overtime Requests</h1>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No overtime requests found
                  </TableCell>
                </TableRow>
              )}

              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="font-medium">
                    {req.employee.name}
                  </TableCell>

                  <TableCell>
                    {new Date(req.date).toLocaleDateString()}
                  </TableCell>

                  <TableCell>{req.hours} hrs</TableCell>

                  {/* ================= STATUS COLUMN ================= */}
                  <TableCell>
                    {req.status === "PENDING" ? (
                      <select
                        className="px-3 py-1 rounded text-sm font-medium
                          bg-yellow-100 text-yellow-800 border border-yellow-300
                          focus:outline-none cursor-pointer"
                        disabled={actionLoading}
                        defaultValue="PENDING"
                        onChange={(e) =>
                          updateStatus(
                            req._id,
                            e.target.value as "APPROVED" | "REJECTED",
                          )
                        }
                      >
                        <option value="PENDING" disabled>
                          PENDING
                        </option>
                        <option value="APPROVED">APPROVE</option>
                        <option value="REJECTED">REJECT</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          req.status === "APPROVED" ? "success" : "destructive"
                        }
                      >
                        {req.status}
                      </Badge>
                    )}
                  </TableCell>

                  {/* ================= VIEW ONLY ================= */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(req)}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= VIEW DIALOG (READ ONLY) ================= */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Overtime Request Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Employee:</strong> {selected.employee.name}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selected.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Hours:</strong> {selected.hours}
              </p>
              <p>
                <strong>Reason:</strong> {selected.reason}
              </p>
              <p>
                <strong>Status:</strong> <Badge>{selected.status}</Badge>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeOvertimeRequests;
