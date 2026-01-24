/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "../../Alert/Toast";
interface Holiday {
  _id?: string;
  title: string;
  date: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  holiday: Holiday | null;
  onSuccess: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL;

const AddHolidayModal = ({
  isOpen,
  onClose,
  mode,
  holiday,
  onSuccess,
}: Props) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<Holiday>({
    title: "",
    date: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && holiday) {
      setForm({
        title: holiday.title,
        date: holiday.date.split("T")[0],
      });
    } else {
      setForm({ title: "", date: "" });
    }

    setErrors({});
  }, [isOpen, mode, holiday]);

  if (!isOpen) return null;

  const validate = () => {
    const e: any = {};
    if (!form.title.trim()) e.title = "Holiday is required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    setLoading(true);

    const res =
      mode === "add"
        ? await axios.post(`${API_BASE}/holidays`, form, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.put(`${API_BASE}/holidays/${holiday?._id}`, form, {
            headers: { Authorization: `Bearer ${token}` },
          });

    toast({
      type: "success",
      title: mode === "add" ? "Holiday Added" : "Holiday Updated",
      message:
        res.data?.message ||
        (mode === "add"
          ? "Holiday has been added successfully."
          : "Holiday has been updated successfully."),
    });

    onSuccess();
    onClose();
  } catch (err: any) {
    toast({
      type: "error",
      title: "Operation Failed",
      message:
        err?.response?.data?.message ||
        "Something went wrong. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-center text-xl font-semibold">
          {mode === "add" ? "Add Holiday" : "Edit Holiday"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium">Holiday *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full rounded border px-3 py-2 ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={`w-full rounded border px-3 py-2 ${
                errors.date ? "border-red-500" : ""
              }`}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full rounded bg-orange-500 py-2 text-white"
          >
            {loading
              ? "Please wait..."
              : mode === "add"
              ? "Add Holiday"
              : "Update Holiday"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHolidayModal;
