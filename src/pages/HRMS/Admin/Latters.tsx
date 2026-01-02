/** @format */

import  { useEffect, useState } from "react";
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

const API_BASE = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  role: string;
}

const LETTER_TYPES = [
  { label: "Offer Letter", value: "OFFER" },
  { label: "Appointment Letter", value: "APPOINTMENT" },
  { label: "Promotion Letter", value: "PROMOTION" },
  { label: "Warning Letter", value: "WARNING" },
];

const Letters = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    letterType: "",
    userId: "",
    message: "",
    file: null as File | null,
  });

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!form.letterType || !form.userId || !form.file) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("letterType", form.letterType);
      formData.append("userId", form.userId);
      formData.append("message", form.message);
      formData.append("file", form.file);

      await axios.post(`${API_BASE}/letters`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Letter sent successfully");

      setForm({
        letterType: "",
        userId: "",
        message: "",
        file: null,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 🔹 THIS CONTENT WILL AUTO COME BETWEEN SIDEBAR & TOPBAR */
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Letters</h1>
        <p className="text-sm text-gray-500">
          Generate & send official letters to employees
        </p>
      </div>

      {/* FORM CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Send Letter</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Letter Type */}
          <div className="space-y-1">
            <Label>
              Letter Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.letterType}
              onValueChange={(value) => setForm({ ...form, letterType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select letter type" />
              </SelectTrigger>
              <SelectContent>
                {LETTER_TYPES.map((lt) => (
                  <SelectItem key={lt.value} value={lt.value}>
                    {lt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Select */}
          <div className="space-y-1">
            <Label>
              Select User <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.userId}
              onValueChange={(value) => setForm({ ...form, userId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>

              <SelectContent
                position="popper"
                className="max-h-60 overflow-y-auto"
              >
                {users.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.name} — {u.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Letter */}
          <div className="space-y-1 md:col-span-2">
            <Label>
              Upload Letter (PDF / DOC) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setForm({
                  ...form,
                  file: e.target.files?.[0] || null,
                })
              }
            />
          </div>

          {/* Message */}
          <div className="space-y-1 md:col-span-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Optional note for the employee"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {/* BUTTON */}
          <div className="md:col-span-2 flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="px-10">
              {loading ? "Sending..." : "Send Letter"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Letters;
