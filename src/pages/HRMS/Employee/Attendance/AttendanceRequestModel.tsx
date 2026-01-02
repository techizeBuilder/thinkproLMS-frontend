/** @format */

import { X } from "lucide-react";

interface Props {
  open: boolean;
  mode: "ADD" | "EDIT" | "VIEW" | "DELETE";
  form: any;
  setForm: any;
  onClose: () => void;
  onSubmit: () => void;
}

export default function AttendanceRequestModal({
  open,
  mode,
  form,
  setForm,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  const disabled = mode === "VIEW" || mode === "DELETE";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {mode === "ADD" && "Add Attendance Request"}
          {mode === "EDIT" && "Edit Attendance Request"}
          {mode === "VIEW" && "View Attendance Request"}
          {mode === "DELETE" && "Delete Attendance Request"}
        </h2>

        {mode !== "DELETE" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Date</label>
              <input
                type="date"
                disabled={disabled}
                className="w-full border rounded p-2"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm">Request Type</label>
              <select
                disabled={disabled}
                className="w-full border rounded p-2"
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">Select</option>
                <option>Missing Punch In</option>
                <option>Missing Punch Out</option>
                <option>Mark Present</option>
                <option>Half Day</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Punch In</label>
                <input
                  type="time"
                  disabled={disabled}
                  className="w-full border rounded p-2"
                  value={form.punchIn || ""}
                  onChange={(e) =>
                    setForm({ ...form, punchIn: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm">Punch Out</label>
                <input
                  type="time"
                  disabled={disabled}
                  className="w-full border rounded p-2"
                  value={form.punchOut || ""}
                  onChange={(e) =>
                    setForm({ ...form, punchOut: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Reason</label>
              <textarea
                disabled={disabled}
                className="w-full border rounded p-2"
                value={form.reason || ""}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
          </div>
        )}

        {mode === "DELETE" && (
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this request?
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          {mode !== "VIEW" && (
            <button
              onClick={onSubmit}
              className={`px-4 py-2 rounded text-white ${
                mode === "DELETE" ? "bg-red-500" : "bg-orange-500"
              }`}
            >
              {mode === "DELETE"
                ? "Delete"
                : mode === "EDIT"
                ? "Update"
                : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
