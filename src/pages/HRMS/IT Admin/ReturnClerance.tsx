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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

type Status = "PENDING" | "CLEARED" | "ISSUE";

interface DepartmentClearance {
  department: string;
  tasks: string[];
  status: Status;
  remarks?: string;
}

interface ClearanceRow {
  _id: string;
  employee: {
    name: string;
    role: string;
  };
  lastWorkingDay: string;
  clearances: DepartmentClearance[];
  overallStatus: "IN_PROGRESS" | "COMPLETED";
}

/* ================= STATUS BADGE ================= */

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

/* ================= MAIN ================= */

const ReturnClerance = () => {
  const [data, setData] = useState<ClearanceRow[]>([]);
  const [selected, setSelected] = useState<ClearanceRow | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔹 FETCH APPROVED RESIGNATIONS → CLEARANCE */
  const fetchClearance = async () => {
    try {
      const res = await axios.get(`${API}/clearances`);
      setData(res.data);
    } catch (error) {
      console.error("Clearance fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClearance();
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-gray-500">Loading clearance...</p>;
  }



    const updateClearanceStatus = async (
      clearanceId: string,
      status: Status
    ) => {
      await axios.patch(`${API}/clearances/${clearanceId}/department`, {
        departmentName: "IT", // 🔥 seedha IT bhej diya
        status,
      });

      fetchClearance();
      setSelected(null);
    };


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
            {data
              .map((row, index) => {
                const getStatus = (dept: string) =>
                  row.clearances.find((c) => c.department === dept)
                    ?.status || "PENDING";
                return (
                  <TableRow key={row._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {row.employee.name}
                    </TableCell>
                    <TableCell>{row.employee.role}</TableCell>
                    <TableCell>
                      {new Date(row.lastWorkingDay).toDateString()}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={getStatus("IT")} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatus("Finance")} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={getStatus("HR")} />
                    </TableCell>

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
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      {/* View Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Clearance Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <b>Employee:</b> {selected.employee.name}
                </p>
                <p>
                  <b>Role:</b> {selected.employee.role}
                </p>
                <p>
                  <b>Last Working Day:</b>{" "}
                  {new Date(selected.lastWorkingDay).toDateString()}
                </p>
                <p>
                  <b>Overall Status:</b>{" "}
                  <Badge
                    variant={
                      selected.overallStatus === "COMPLETED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selected.overallStatus}
                  </Badge>
                </p>
              </div>

              {/* Department Clearances */}
              <div className="space-y-4">
                {selected.clearances.map((c) => {
                  const isIT = c.department === "IT";

                  return (
                    <div
                      key={c.department}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{c.department}</h3>
                        <StatusBadge status={c.status} />
                      </div>

                      {/* 👇 Only IT admin can update IT department */}
                      {isIT && c.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              updateClearanceStatus(selected._id, "CLEARED")
                            }
                          >
                            Mark Cleared
                          </Button>

                          <Button
                            variant="destructive"
                            onClick={() =>
                              updateClearanceStatus(selected._id, "ISSUE")
                            }
                          >
                            Mark Issue
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

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

export default ReturnClerance;
