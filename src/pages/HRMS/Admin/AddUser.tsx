/** @format */

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_URL;

export default function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

const ROLE_OPTIONS = [
  // Core roles
  { label: "Super Admin", value: "superadmin" },
  { label: "HR Admin", value: "hr-admin" },
  { label: "Manager", value: "manager" },
  { label: "Finance", value: "finance" },
  { label: "IT Admin", value: "it-admin" },

  // Academic / LMS
  { label: "Lead Mentor", value: "leadmentor" },
  { label: "School Admin", value: "schooladmin" },
  { label: "Mentor", value: "mentor" },
  { label: "Student", value: "student" },

  // Sales
  { label: "Sales Manager", value: "sales-manager" },
  { label: "Sales Executive", value: "sales-executive" },

  // Others
  { label: "Guest", value: "guest" },
];



  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      alert("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized. Please login again.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_BASE}/users`,
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password, // ✅ password sent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("User added successfully");

      setFormData({
        name: "",
        email: "",
        role: "",
        password: "",
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Add New Employee
      </h1>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Employee Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {/* Name */}
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label>Email Address</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label>Role</Label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({ name: "", email: "", role: "", password: "" })
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
