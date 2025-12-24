/** @format */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

/* ================= STATIC DATA ================= */

const EMPLOYEES = [
  { id: "1", name: "Rahul Sharma" },
  { id: "2", name: "Amit Verma" },
];

const DEPARTMENTS = ["IT", "Admin", "Finance"];

const INITIAL_TASKS = [
  {
    id: "t1",
    employee: "Rahul Sharma",
    department: "IT",
    task: "Laptop Allocation",
    status: "Pending",
  },
];

/* ================= COMPONENT ================= */

const OnboardingTasks = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    department: "",
    task: "",
  });

  /* ================= ADD TASK ================= */
  const addTask = () => {
    if (!form.employee || !form.department || !form.task) return;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        employee: form.employee,
        department: form.department,
        task: form.task,
        status: "Pending",
      },
    ]);

    setForm({ employee: "", department: "", task: "" });
    setOpen(false);
  };

  /* ================= STATUS BADGE ================= */
  const statusColor = (status: string) =>
    status === "Completed" ? "success" : "secondary";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Onboarding Tasks</h1>
          <p className="text-sm text-gray-500">
            Assign onboarding tasks to departments
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>+ Assign Task</Button>
      </div>

      {/* TASK LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Task</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3">{t.employee}</td>
                  <td className="p-3">{t.department}</td>
                  <td className="p-3">{t.task}</td>
                  <td className="p-3">
                    <Badge variant={statusColor(t.status)}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ASSIGN TASK MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Onboarding Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee */}
            <div>
              <Label>Employee</Label>
              <Select
                value={form.employee}
                onValueChange={(v) => setForm({ ...form, employee: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((e) => (
                    <SelectItem key={e.id} value={e.name}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task */}
            <div>
              <Label>Task</Label>
              <Input
                placeholder="e.g. Laptop Allocation"
                value={form.task}
                onChange={(e) => setForm({ ...form, task: e.target.value })}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTask}>Assign Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingTasks;
