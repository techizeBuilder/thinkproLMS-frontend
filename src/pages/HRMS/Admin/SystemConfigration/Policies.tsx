/** @format */
import { useState } from "react";

export default function Policies() {
  const [activeTab, setActiveTab] = useState<"leave" | "attendance">("leave");

  /* ================= LEAVE POLICIES ================= */
  const [editingLeaveId, setEditingLeaveId] = useState<number | null>(null);

  const [leaves, setLeaves] = useState([
    {
      id: 1,
      name: "Casual Leave (CL)",
      total: 12,
      accrual: "Monthly",
      carryForward: true,
      maxCarry: 6,
      paid: true,
    },
    {
      id: 2,
      name: "Sick Leave (SL)",
      total: 8,
      accrual: "Yearly",
      carryForward: false,
      maxCarry: 0,
      paid: true,
    },
    {
      id: 3,
      name: "Earned Leave (EL)",
      total: 15,
      accrual: "Monthly",
      carryForward: true,
      maxCarry: 10,
      paid: true,
    },
    {
      id: 4,
      name: "Maternity Leave",
      total: 180,
      accrual: "Yearly",
      carryForward: false,
      maxCarry: 0,
      paid: true,
    },
    {
      id: 5,
      name: "Unpaid Leave (LWP)",
      total: 0,
      accrual: "None",
      carryForward: false,
      maxCarry: 0,
      paid: false,
    },
  ]);

  /* ================= ATTENDANCE POLICY ================= */
  const [editAttendance, setEditAttendance] = useState(false);

  const [attendance, setAttendance] = useState({
    graceTime: 10,
    lateAfter: 15,
    lateCountHalfDay: 3,
    earlyExitMinutes: 30,
    overtimeEnabled: true,
    overtimeAfter: 8,
    overtimeType: "Paid",
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">HR Policies</h1>
        <p className="text-sm text-gray-500">
          System Configuration → HR Policies
        </p>
      </div>

      {/* ================= TOGGLE ================= */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-4 py-2 rounded ${
            activeTab === "leave" ? "bg-orange-500 text-white" : "bg-gray-100"
          }`}
        >
          Leave Policies
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`px-4 py-2 rounded ${
            activeTab === "attendance"
              ? "bg-orange-500 text-white"
              : "bg-gray-100"
          }`}
        >
          Attendance Policies
        </button>
      </div>

      {/* ================= LEAVE POLICIES ================= */}
      {activeTab === "leave" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Leave Policies</h2>
          <p className="text-gray-600">
            These policies define leave entitlement, accrual and carry-forward
            rules for employees.
          </p>

          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="border rounded p-4 bg-white space-y-3"
            >
              {editingLeaveId === leave.id ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Leave Name</label>
                    <input
                      className="border p-2 w-full"
                      value={leave.name}
                      onChange={(e) =>
                        setLeaves((prev) =>
                          prev.map((l) =>
                            l.id === leave.id
                              ? { ...l, name: e.target.value }
                              : l
                          )
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Total Leaves / Year
                    </label>
                    <input
                      type="number"
                      className="border p-2 w-full"
                      value={leave.total}
                      onChange={(e) =>
                        setLeaves((prev) =>
                          prev.map((l) =>
                            l.id === leave.id
                              ? { ...l, total: +e.target.value }
                              : l
                          )
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Accrual Type</label>
                    <select
                      className="border p-2 w-full"
                      value={leave.accrual}
                      onChange={(e) =>
                        setLeaves((prev) =>
                          prev.map((l) =>
                            l.id === leave.id
                              ? { ...l, accrual: e.target.value }
                              : l
                          )
                        )
                      }
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                      <option>None</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Carry Forward Allowed
                    </label>
                    <select
                      className="border p-2 w-full"
                      value={leave.carryForward ? "Yes" : "No"}
                      onChange={(e) =>
                        setLeaves((prev) =>
                          prev.map((l) =>
                            l.id === leave.id
                              ? {
                                  ...l,
                                  carryForward: e.target.value === "Yes",
                                }
                              : l
                          )
                        )
                      }
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>

                  {leave.carryForward && (
                    <div>
                      <label className="text-sm font-medium">
                        Max Carry Forward
                      </label>
                      <input
                        type="number"
                        className="border p-2 w-full"
                        value={leave.maxCarry}
                        onChange={(e) =>
                          setLeaves((prev) =>
                            prev.map((l) =>
                              l.id === leave.id
                                ? { ...l, maxCarry: +e.target.value }
                                : l
                            )
                          )
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Paid Leave</label>
                    <select
                      className="border p-2 w-full"
                      value={leave.paid ? "Yes" : "No"}
                      onChange={(e) =>
                        setLeaves((prev) =>
                          prev.map((l) =>
                            l.id === leave.id
                              ? { ...l, paid: e.target.value === "Yes" }
                              : l
                          )
                        )
                      }
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setEditingLeaveId(null)}
                    className="text-green-600 font-medium"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">{leave.name}</h3>
                  <p>Total / Year: {leave.total}</p>
                  <p>Accrual: {leave.accrual}</p>
                  <p>Carry Forward: {leave.carryForward ? "Yes" : "No"}</p>
                  <p>Paid Leave: {leave.paid ? "Yes" : "No"}</p>

                  <button
                    onClick={() => setEditingLeaveId(leave.id)}
                    className="text-blue-600 text-sm"
                  >
                    ✏️ Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= ATTENDANCE POLICIES ================= */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Attendance Policies</h2>
          <p className="text-gray-600">
            Attendance rules define grace time, late marks, early exits and
            overtime calculation.
          </p>

          <div className="border rounded p-4 bg-white space-y-3">
            {editAttendance ? (
              <>
                <div>
                  <label className="text-sm font-medium">
                    Grace Time (minutes)
                  </label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    value={attendance.graceTime}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        graceTime: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Late After (minutes)
                  </label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    value={attendance.lateAfter}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        lateAfter: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    No. of Lates = Half Day
                  </label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    value={attendance.lateCountHalfDay}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        lateCountHalfDay: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Early Exit (minutes)
                  </label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    value={attendance.earlyExitMinutes}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        earlyExitMinutes: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Overtime After (hours)
                  </label>
                  <input
                    type="number"
                    className="border p-2 w-full"
                    value={attendance.overtimeAfter}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        overtimeAfter: +e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Overtime Type</label>
                  <select
                    className="border p-2 w-full"
                    value={attendance.overtimeType}
                    onChange={(e) =>
                      setAttendance({
                        ...attendance,
                        overtimeType: e.target.value,
                      })
                    }
                  >
                    <option>Paid</option>
                    <option>Comp-Off</option>
                  </select>
                </div>

                <button
                  onClick={() => setEditAttendance(false)}
                  className="text-green-600 font-medium"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <p>Grace Time: {attendance.graceTime} minutes</p>
                <p>Late After: {attendance.lateAfter} minutes</p>
                <p>{attendance.lateCountHalfDay} lates = Half Day</p>
                <p>Early Exit: {attendance.earlyExitMinutes} minutes</p>
                <p>
                  Overtime: After {attendance.overtimeAfter} hrs (
                  {attendance.overtimeType})
                </p>

                <button
                  onClick={() => setEditAttendance(true)}
                  className="text-blue-600 text-sm"
                >
                  ✏️ Edit
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <p className="text-sm text-gray-500">
        Only HR and Admin can edit these policies. Changes are applied
        immediately within the system.
      </p>
    </div>
  );
}
