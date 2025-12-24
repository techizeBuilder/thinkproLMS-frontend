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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = "PENDING" | "CLEARED" | "ISSUE";

interface DepartmentClearance {
  department: "IT" | "FINANCE" | "HR";
  tasks: string[];
  status: Status;
  remarks?: string;
}

interface ClearanceRow {
  id: string;
  employee: string;
  role: string;
  lastWorkingDay: string;
  clearances: DepartmentClearance[];
  overallStatus: "IN_PROGRESS" | "COMPLETED";
}

/* 🔹 STATIC DATA */
const clearanceData: ClearanceRow[] = [
  {
    id: "1",
    employee: "Rahul Sharma",
    role: "Software Developer",
    lastWorkingDay: "30 Jan 2025",
    overallStatus: "IN_PROGRESS",
    clearances: [
      {
        department: "IT",
        tasks: ["Laptop Returned", "Email Access Revoked"],
        status: "CLEARED",
      },
      {
        department: "FINANCE",
        tasks: ["Final Salary", "Advance Recovery"],
        status: "PENDING",
      },
      {
        department: "HR",
        tasks: ["Exit Interview", "ID Card Submitted"],
        status: "PENDING",
      },
    ],
  },
  {
    id: "2",
    employee: "Neha Verma",
    role: "HR Executive",
    lastWorkingDay: "15 Jan 2025",
    overallStatus: "COMPLETED",
    clearances: [
      {
        department: "IT",
        tasks: ["Laptop Returned"],
        status: "CLEARED",
      },
      {
        department: "FINANCE",
        tasks: ["Full & Final"],
        status: "CLEARED",
      },
      {
        department: "HR",
        tasks: ["Documents Handover"],
        status: "CLEARED",
      },
    ],
  },
];

/* 🔹 Status Badge */
const StatusBadge = ({ status }: { status: Status }) => {
  const color =
    status === "CLEARED"
      ? "bg-green-100 text-green-700"
      : status === "ISSUE"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

const Clearance = () => {
  const [selected, setSelected] = useState<ClearanceRow | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Clearance Workflow</h1>
        <p className="text-sm text-gray-500">
          Department-wise employee offboarding clearance
        </p>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr No.</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>LWD</TableHead>
              <TableHead>IT</TableHead>
              <TableHead>Finance</TableHead>
              <TableHead>HR</TableHead>
              <TableHead>Overall</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clearanceData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{row.employee}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.lastWorkingDay}</TableCell>

                {row.clearances.map((c) => (
                  <TableCell key={c.department}>
                    <StatusBadge status={c.status} />
                  </TableCell>
                ))}

                <TableCell>
                  <Badge
                    variant={
                      row.overallStatus === "COMPLETED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {row.overallStatus}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(row)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 🔍 View Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Clearance Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <b>Employee:</b> {selected.employee}
                </p>
                <p>
                  <b>Role:</b> {selected.role}
                </p>
                <p>
                  <b>Last Working Day:</b> {selected.lastWorkingDay}
                </p>
                <p>
                  <b>Status:</b> {selected.overallStatus}
                </p>
              </div>

              {/* Clearance Sections */}
              {selected.clearances.map((c) => (
                <div
                  key={c.department}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{c.department} Clearance</h3>
                    <StatusBadge status={c.status} />
                  </div>

                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {c.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>

                  {c.remarks && (
                    <p className="text-sm text-red-600">Remarks: {c.remarks}</p>
                  )}
                </div>
              ))}

              <div className="text-right">
                <Button onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clearance;
