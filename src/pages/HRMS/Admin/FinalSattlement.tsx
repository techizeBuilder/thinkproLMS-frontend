/** @format */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ================= TYPES ================= */

type FnFStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SENT_TO_FINANCE"
  | "PAID"
  | "ON_HOLD";

interface FnFRecord {
  id: string;
  name: string;
  role: string;
  doj: string;
  lwd: string;
  status: FnFStatus;
  earnings: number;
  deductions: number;
}

/* ================= STATIC DATA ================= */

const INITIAL_DATA: FnFRecord[] = [
  {
    id: "1",
    name: "Rahul Verma",
    role: "Software Engineer",
    doj: "12 Jan 2023",
    lwd: "20 Dec 2024",
    status: "NOT_STARTED",
    earnings: 43000,
    deductions: 6700,
  },
  {
    id: "2",
    name: "Neha Singh",
    role: "HR Executive",
    doj: "01 Feb 2022",
    lwd: "15 Dec 2024",
    status: "IN_PROGRESS",
    earnings: 38000,
    deductions: 4500,
  },
];

/* ================= STATUS BADGE ================= */

const StatusBadge = ({ status }: { status: FnFStatus }) => {
  const map: any = {
    NOT_STARTED: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    SENT_TO_FINANCE: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    ON_HOLD: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

/* ================= MAIN COMPONENT ================= */

const FinalSettlement = () => {
  const [data, setData] = useState<FnFRecord[]>(INITIAL_DATA);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FnFRecord | null>(null);

  /* ================= OPEN MODAL ================= */
  const openFnF = (record: FnFRecord) => {
    setSelected(record);
    setOpen(true);
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = (status: FnFStatus) => {
    if (!selected) return;

    setData((prev) =>
      prev.map((item) => (item.id === selected.id ? { ...item, status } : item))
    );

    setSelected({ ...selected, status });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Full & Final Settlement</h1>
        <p className="text-sm text-gray-500">
          Manage employee exit payments and settlements
        </p>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Employees for FnF</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>LWD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{emp.lwd}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFnF(emp)}
                    >
                      {emp.status === "NOT_STARTED" ? "Start" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= FNf MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Full & Final Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* EMP INFO */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {selected.name}
                </div>
                <div>
                  <strong>Role:</strong> {selected.role}
                </div>
                <div>
                  <strong>DOJ:</strong> {selected.doj}
                </div>
                <div>
                  <strong>LWD:</strong> {selected.lwd}
                </div>
              </div>

              {/* EARNINGS */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input value={selected.earnings} disabled />
                </CardContent>
              </Card>

              {/* DEDUCTIONS */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input value={selected.deductions} disabled />
                </CardContent>
              </Card>

              {/* NET PAYABLE */}
              <div className="flex justify-between text-sm font-semibold">
                <span>Net Payable</span>
                <span>₹{selected.earnings - selected.deductions}</span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => updateStatus("IN_PROGRESS")}
                >
                  Save Draft
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => updateStatus("SENT_TO_FINANCE")}
                >
                  Send to Finance
                </Button>

                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateStatus("PAID")}
                >
                  Mark as Paid
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinalSettlement;
