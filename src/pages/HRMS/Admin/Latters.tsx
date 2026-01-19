/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Loader from "../Loader";

const API_BASE = import.meta.env.VITE_API_URL;
const ViewAPI = API_BASE.replace("/api", "");
/* ================= MODAL ================= */
const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div
      className="
        fixed 
        top-16 
        left-[260px] 
        right-0 
        bottom-0 
        bg-black/40 
        z-[9999] 
        flex 
        items-center 
        justify-center 
        px-4
      "
      onClick={onClose} // 👈 OUTSIDE CLICK
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // 👈 INSIDE CLICK SAFE
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};


/* ================= INTERFACES ================= */
interface User {
  _id: string;
  name: string;
  role: string;
}

interface LetterHistory {
  _id: string;
  letterType: string;
  createdAt: string;
  filePath: string;
  user: {
    name: string;
    role: string;
  };
}

const LETTER_TYPES = [
  { label: "Offer Letter", value: "OFFER" },
  { label: "Appointment Letter", value: "APPOINTMENT" },
  { label: "Promotion Letter", value: "PROMOTION" },
  { label: "Warning Letter", value: "WARNING" },
];

const Letters = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [letters, setLetters] = useState<LetterHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [viewLetter, setViewLetter] = useState<LetterHistory | null>(null);

  const [form, setForm] = useState({
    letterType: "",
    userId: "",
    message: "",
    file: null as File | null,
  });

  const [errors, setErrors] = useState({
    letterType: "",
    userId: "",
    file: "",
  });

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setUsers(res.data);
  };

  /* ================= FETCH LETTERS ================= */
  const fetchLetters = async () => {
    const res = await axios.get(`${API_BASE}/letters`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setLetters(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchLetters();
  }, []);

  /* ================= VALIDATION ================= */
  const validate = () => {
    let valid = true;
    const e = { letterType: "", userId: "", file: "" };

    if (!form.letterType) (e.letterType = "Required"), (valid = false);
    if (!form.userId) (e.userId = "Required"), (valid = false);
    if (!form.file) (e.file = "Upload letter"), (valid = false);

    setErrors(e);
    return valid;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const fd = new FormData();
    fd.append("letterType", form.letterType);
    fd.append("userId", form.userId);
    fd.append("message", form.message);
    fd.append("file", form.file as File);

    await axios.post(`${API_BASE}/letters`, fd, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setForm({ letterType: "", userId: "", message: "", file: null });
    setOpenSendModal(false);
    fetchLetters();
    setLoading(false);
  };
    if (loading) {
      return (
        <div className="relative min-h-screen">
          <Loader />
        </div>
      );
    }
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Letters</h1>
          <p className="text-sm text-gray-500">
            Manage & send employee letters
          </p>
        </div>

        <Button onClick={() => setOpenSendModal(true)}>Send Letter</Button>
      </div>

      {/* ================= TABLE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Letters</CardTitle>
        </CardHeader>

        <CardContent>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Sr.No</th>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Letter Type</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Letter</th>
                </tr>
              </thead>
              <tbody>
                {letters.map((l, i) => (
                  <tr key={l._id} className="border-b">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">
                      <div className="font-medium">{l.user.name}</div>
                      <div className="text-xs text-gray-500">{l.user.role}</div>
                    </td>
                    <td className="p-3">{l.letterType}</td>
                    <td className="p-3">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `${ViewAPI}/${l.filePath}`,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {letters.map((l, i) => (
              <div key={l._id} className="border rounded-lg p-4 space-y-2">
                <div className="text-xs text-gray-500">#{i + 1}</div>
                <div className="font-semibold">{l.user.name}</div>
                <div className="text-sm">{l.letterType}</div>
                <div className="text-xs text-gray-500">
                  {new Date(l.createdAt).toLocaleDateString()}
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setViewLetter(l)}
                >
                  View Letter
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================= SEND LETTER MODAL ================= */}
      {openSendModal && (
        <Modal title="Send Letter" onClose={() => setOpenSendModal(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Letter Type *</Label>
              <Select
                value={form.letterType}
                onValueChange={(v) => setForm({ ...form, letterType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  {LETTER_TYPES.map((lt) => (
                    <SelectItem key={lt.value} value={lt.value}>
                      {lt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.letterType && (
                <p className="text-xs text-red-500">{errors.letterType}</p>
              )}
            </div>

            <div>
              <Label>Select User *</Label>
              <Select
                value={form.userId}
                onValueChange={(v) => setForm({ ...form, userId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto <SelectContent z-[10000]">
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name} — {u.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Upload Letter *</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setForm({ ...form, file: e.target.files?.[0] || null })
                }
              />
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send Letter"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= VIEW LETTER MODAL ================= */}
      {viewLetter && (
        <Modal
          title={`${viewLetter.letterType} - ${viewLetter.user.name}`}
          onClose={() => setViewLetter(null)}
        >
          <iframe
            src={`${ViewAPI}/${viewLetter.filePath}`}
            className="w-full h-[70vh] border rounded"
          />
        </Modal>
      )}
    </div>
  );
};

export default Letters;
