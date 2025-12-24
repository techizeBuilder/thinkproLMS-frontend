/** @format */

import { useState } from "react";
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

/* ================= TYPES ================= */

type ResignationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_CLEARANCE"
  | "COMPLETED";

interface Resignation {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  lastWorkingDay: string;
  appliedOn: string;
  reason: string;
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

/* ================= STATIC DATA ================= */

const RESIGNATION_DATA: Resignation[] = [
  {
    id: "1",
    employeeName: "Rahul Sharma",
    role: "Software Engineer",
    department: "IT",
    lastWorkingDay: "2025-01-30",
    appliedOn: "2025-01-01",
    reason: "Better opportunity",
    status: "PENDING",
  },
  {
    id: "2",
    employeeName: "Neha Verma",
    role: "HR Executive",
    department: "HR",
    lastWorkingDay: "2025-02-10",
    appliedOn: "2025-01-05",
    reason: "Personal reasons",
    status: "APPROVED",
  },
  {
    id: "3",
    employeeName: "Amit Singh",
    role: "Accountant",
    department: "Finance",
    lastWorkingDay: "2025-01-25",
    appliedOn: "2024-12-28",
    reason: "Relocation",
    status: "IN_CLEARANCE",
  },
  {
    id: "4",
    employeeName: "Pooja Gupta",
    role: "Mentor",
    department: "Academics",
    lastWorkingDay: "2025-01-20",
    appliedOn: "2024-12-20",
    reason: "Higher studies",
    status: "COMPLETED",
  },
];

/* ================= MAIN COMPONENT ================= */

const Resignation = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Resignation | null>(null);

  const handleView = (item: Resignation) => {
    setSelected(item);
    setOpen(true);
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
            {RESIGNATION_DATA.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  {item.employeeName}
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>{item.lastWorkingDay}</TableCell>
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
                <strong>Employee:</strong> {selected.employeeName}
              </p>
              <p>
                <strong>Role:</strong> {selected.role}
              </p>
              <p>
                <strong>Department:</strong> {selected.department}
              </p>
              <p>
                <strong>Applied On:</strong> {selected.appliedOn}
              </p>
              <p>
                <strong>Last Working Day:</strong> {selected.lastWorkingDay}
              </p>
              <p>
                <strong>Reason:</strong> {selected.reason}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selected.status} />
              </p>

              {/* Future actions */}
              <div className="flex gap-2 pt-3">
                <Button size="sm">Approve</Button>
                <Button size="sm" variant="destructive">
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resignation;
