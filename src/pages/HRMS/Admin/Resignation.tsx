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
import { toast } from "../Alert/Toast";
const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

type ResignationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_CLEARANCE"
  | "COMPLETED";

interface Resignation {
  _id: string;
  employee: {
    name: string;
    role: string;
    departmentId?: { name: string };
  };
  expectedLastWorkingDay: string;
  createdAt: string;
  reasonText: string;
  status: ResignationStatus;
}

/* ================= STATUS BADGE ================= */

const StatusBadge = ({ status }: { status: ResignationStatus }) => {
  const color =
    status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
      ? "bg-red-100 text-red-700"
      : status === "IN_CLEARANCE"
      ? "bg-blue-100 text-blue-700"
      : status === "COMPLETED"
      ? "bg-gray-200 text-gray-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${color}`}>
      {status}
    </span>
  );
};

/* ================= MAIN COMPONENT ================= */

const Resignation = () => {
  const [data, setData] = useState<Resignation[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Resignation | null>(null);

  /* ================= FETCH ================= */

  const fetchResignations = async () => {
    const res = await axios.get(`${API}/resignation/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setData(res.data);
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  /* ================= ACTIONS ================= */

  const handleView = (item: Resignation) => {
    setSelected(item);
    setOpen(true);
  };

const handleApprove = async () => {
  if (!selected) return;

  try {
    const res = await axios.patch(
      `${API}/resignation/status/${selected._id}`,
      { status: "APPROVED" },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    toast({
      type: "success",
      title: "Resignation Approved",
      message:
        res.data?.message || "Resignation has been approved successfully.",
    });

    setOpen(false);
    fetchResignations();
  } catch (error: any) {
    toast({
      type: "error",
      title: "Approval Failed",
      message:
        error?.response?.data?.message ||
        "Unable to approve resignation. Please try again.",
    });
  }
};

const handleReject = async () => {
  if (!selected) return;

  try {
    const res = await axios.patch(
      `${API}/resignation/status/${selected._id}`,
      { status: "REJECTED" },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    toast({
      type: "success",
      title: "Resignation Rejected",
      message:
        res.data?.message || "Resignation has been rejected successfully.",
    });

    setOpen(false);
    fetchResignations();
  } catch (error: any) {
    toast({
      type: "error",
      title: "Rejection Failed",
      message:
        error?.response?.data?.message ||
        "Unable to reject resignation. Please try again.",
    });
  }
};


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resignation Requests</h1>
        <p className="text-sm text-gray-500">
          Manage employee resignation & offboarding process
        </p>
      </div>

      {/* ================= TABLE ================= */}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Sr No.</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Last Working Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {item.employee.name}
                </TableCell>
                <TableCell>{item.employee.role}</TableCell>
                <TableCell>{item.employee.departmentId?.name}</TableCell>
                <TableCell>
                  {new Date(item.expectedLastWorkingDay).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(item)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ================= VIEW DIALOG ================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resignation Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Employee:</strong> {selected.employee.name}
              </p>
              <p>
                <strong>Role:</strong> {selected.employee.role}
              </p>
              <p>
                <strong>Department:</strong> {selected.employee.departmentId?.name || "N/A"}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {new Date(selected.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Last Working Day:</strong>{" "}
                {new Date(selected.expectedLastWorkingDay).toLocaleDateString()}
              </p>
              <p>
                <strong>Reason:</strong> {selected.reasonText}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selected.status} />
              </p>

              {/* ACTIONS */}
              {selected.status === "PENDING" && (
                <div className="flex gap-2 pt-3">
                  <Button size="sm" onClick={handleApprove}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resignation;
