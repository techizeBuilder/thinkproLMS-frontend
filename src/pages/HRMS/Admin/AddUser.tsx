/** @format */

import { useState,useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadMentorForm } from "./LeadMentorForm";

const API_BASE = import.meta.env.VITE_API_URL;

const ROLE_OPTIONS = [
  { label: "Super Admin", value: "superadmin" },
  { label: "HR Admin", value: "hr-admin" },
  { label: "Manager", value: "manager" },
  { label: "Finance", value: "finance" },
  { label: "IT Admin", value: "it-admin" },
  { label: "Lead Mentor", value: "leadmentor" },
  { label: "School Admin", value: "schooladmin" },
  { label: "Mentor", value: "mentor" },
  { label: "Student", value: "student" },
  { label: "Sales Manager", value: "sales-manager" },
  { label: "Sales Executive", value: "sales-executive" },
  { label: "Guest", value: "guest" },
];

export default function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

const [documents, setDocuments] = useState<{
  aadhaar: File | null;
  pan: File | null;
  marksheet12: File | null;
  passbook: File | null;
}>({
  aadhaar: null,
  pan: null,
  marksheet12: null,
  passbook: null,
});

const aadhaarRef = useRef<HTMLInputElement | null>(null);
const panRef = useRef<HTMLInputElement | null>(null);
const marksheet12Ref = useRef<HTMLInputElement | null>(null);
const passbookRef = useRef<HTMLInputElement | null>(null);



  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";

    if (!formData.role) newErrors.role = "Role is required";


      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Minimum 6 characters required";
    

    if (!documents.aadhaar) {
      newErrors.aadhaar = "Aadhaar card is required";
    }
    if (!documents.marksheet12) {
      newErrors.marksheet12 = "12th Marksheet is required";
    }
    if (!documents.passbook) {
      newErrors.passbook = "Passbook is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    try {
      setLoading(true);

      /* ================= 1️⃣ CREATE USER ================= */
      const userRes = await axios.post(
        `${API_BASE}/users`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userId = userRes.data.user.id;

      /* ================= 2️⃣ UPLOAD DOCUMENTS ================= */

      // Aadhaar upload
     if (documents.aadhaar) {
       const aadhaarForm = new FormData();
       aadhaarForm.append("type", "AADHAAR");
       aadhaarForm.append("file", documents.aadhaar);

       await axios.post(
         `${API_BASE}/documents/upload/${userId}`, // ✅ userId in URL
         aadhaarForm,
         {
           headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": "multipart/form-data",
           },
         }
       );
     }


      // PAN upload
    if (documents.pan) {
      const panForm = new FormData();
      panForm.append("type", "PAN");
      panForm.append("file", documents.pan);

      await axios.post(
        `${API_BASE}/documents/upload/${userId}`, // ✅ userId in URL
        panForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }

    if (documents.marksheet12) {
      const form = new FormData();
      form.append("type", "MARKSHEET_12");
      form.append("file", documents.marksheet12);

      await axios.post(`${API_BASE}/documents/upload/${userId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    if (documents.passbook) {
      const form = new FormData();
      form.append("type", "PASSBOOK");
      form.append("file", documents.passbook);

      await axios.post(`${API_BASE}/documents/upload/${userId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }


      /* ================= SUCCESS ================= */
      alert("User & documents added successfully");

      setFormData({ name: "", email: "", role: "", password: "" });
      setDocuments({
        aadhaar: null,
        pan: null,
        marksheet12: null,
        passbook: null,
      });
       aadhaarRef.current && (aadhaarRef.current.value = "");
       panRef.current && (panRef.current.value = "");
       marksheet12Ref.current && (marksheet12Ref.current.value = "");
       passbookRef.current && (passbookRef.current.value = "");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Add User</h1>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>User Basic Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            id="add-user-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Name */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <Label>Role</Label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-10 border rounded-md px-3"
              >
                <option value="">Select role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>

            {/* Password */}

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* LEAD MENTOR EXTRA FORM */}
      {formData.role === "leadmentor" && <LeadMentorForm />}

      {/* ================= UPLOAD DOCUMENTS SECTION ================= */}

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Upload Documents
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Aadhaar */}
          <div className="space-y-1">
            <Label>
              Aadhaar Card <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={aadhaarRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  aadhaar: e.target.files?.[0] || null,
                })
              }
            />

            {errors.aadhaar && (
              <p className="text-sm text-red-500">{errors.aadhaar}</p>
            )}
          </div>

          {/* PAN */}
          <div className="space-y-1">
            <Label>PAN Card (Optional)</Label>
            <Input
              ref={panRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  pan: e.target.files?.[0] || null,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>
              12th Marksheet OR Degree<span className="text-red-500">*</span>
            </Label>
            <Input
              ref={marksheet12Ref}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  marksheet12: e.target.files?.[0] || null,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>
              Passbook <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={passbookRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  passbook: e.target.files?.[0] || null,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ================= ADD USER BUTTON (LAST) ================= */}

      <div className="w-full max-w-3xl flex justify-center pt-6">
        <Button
          type="submit"
          form="add-user-form"
          disabled={loading}
          className="px-12 h-11"
        >
          {loading ? "Adding..." : "Add User"}
        </Button>
      </div>
    </div>
  );
}
