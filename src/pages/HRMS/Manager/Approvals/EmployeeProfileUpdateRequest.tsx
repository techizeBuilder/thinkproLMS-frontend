/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "../../Alert/Toast";
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
import { Eye, UserCog } from "lucide-react";
import Loader from "../../Loader";

const API_BASE = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface User {
  _id: string;
  name: string;
  role: string;
}

interface ProfileUpdateRequest {
  _id: string;
  employee: User;
  updateType: string;
  newValue: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

/* ================= COMPONENT ================= */

const EmployeeProfileUpdateRequest = () => {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [selected, setSelected] = useState<ProfileUpdateRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH TEAM REQUESTS ================= */

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile-update/team-requests`, {
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

  /* ================= UPDATE STATUS ================= */

const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
  try {
    setActionLoading(true);

    const res = await axios.patch(
      `${API_BASE}/profile-update/${id}`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    toast({
      type: "success",
      title:
        status === "APPROVED"
          ? "Profile Update Approved"
          : "Profile Update Rejected",
      message:
        res.data?.message ||
        `Profile update request has been ${status.toLowerCase()} successfully.`,
    });

    fetchRequests();
  } catch (error: any) {
    toast({
      type: "error",
      title: "Action Failed",
      message:
        error?.response?.data?.message ||
        "Unable to update profile request. Please try again.",
    });
  } finally {
    setActionLoading(false);
  }
};


  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <UserCog size={22} /> Team Profile Update Requests
          </h1>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No profile update requests found
                  </TableCell>
                </TableRow>
              )}

              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell className="font-medium">
                    {req.employee.name}
                  </TableCell>

                  <TableCell className="capitalize">{req.updateType}</TableCell>

                  <TableCell>{req.newValue}</TableCell>

                  {/* ================= STATUS ================= */}
                  <TableCell>
                    {req.status === "PENDING" ? (
                      <select
                        className="px-3 py-1 rounded text-sm font-medium
                          bg-yellow-100 text-yellow-800 border border-yellow-300
                          focus:outline-none cursor-pointer"
                        defaultValue="PENDING"
                        disabled={actionLoading}
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

                  {/* ================= VIEW ================= */}
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

      {/* ================= VIEW MODAL ================= */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Update Request</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Employee:</strong> {selected.employee.name}
              </p>

              <p>
                <strong>Field:</strong>{" "}
                <span className="capitalize">{selected.updateType}</span>
              </p>

              <p>
                <strong>New Value:</strong> {selected.newValue}
              </p>

              <p>
                <strong>Reason:</strong> {selected.reason}
              </p>

              <p>
                <strong>Status:</strong> <Badge>{selected.status}</Badge>
              </p>

              <p className="text-xs text-gray-500">
                Requested on {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeProfileUpdateRequest;
