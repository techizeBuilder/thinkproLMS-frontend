/** @format */

import { useState,useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadMentorForm } from "./LeadMentorForm";

const API_BASE = import.meta.env.VITE_API_URL;

const ROLE_OPTIONS = [
  { label: "Super Admin", value: "superadmin" },
  { label: "Admin", value: "Admin" },
  { label: "School Admin", value: "schooladmin" },

  { label: "Lead Mentor", value: "leadmentor" },
  { label: "Mentor", value: "mentor" },
  { label: "Student", value: "student" },
  { label: "Guest", value: "guest" },

  { label: "Sales Manager", value: "sales-manager" },
  { label: "Sales Executive", value: "sales-executive" },

  { label: "HR Admin", value: "hr-admin" },
  { label: "Manager", value: "manager" },
  { label: "Finance", value: "finance" },
  { label: "IT Admin", value: "IT-Admin" },
];

export default function AddUser() {
  const token = localStorage.getItem("token");

  /* ================= BASIC INFORMATION ================= */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
    joiningDate: "",
    password: "",
    role: "",
  });

  /* ================= COMPANY & JOB ================= */
  const [job, setJob] = useState({
    companyId: "",
    branchId: "",
    departmentId: "",
    designationId: "",
    managerId: "",
    employmentType: "",
  });

  /* ================= DROPDOWNS ================= */
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  /* ================= DOCUMENTS ================= */



  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  /* ================= FETCH MASTER ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCompanies(res.data));

    axios
      .get(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBranches(res.data));

    axios
      .get(`${API_BASE}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDepartments(res.data));

    axios
      .get(`${API_BASE}/designations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDesignations(res.data));

    axios
      .get(`${API_BASE}/users?role=manager`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setManagers(res.data));
  }, []);

  /* ================= FILTER ================= */
  const filteredBranches = branches.filter(
    (b) => b.companyId._id === job.companyId
  );
  const filteredDepartments = departments.filter(
    (d) => d.branchId._id === job.branchId
  );
  const filteredDesignations = designations.filter(
    (d) => d.departmentId._id === job.departmentId
  );

  /* ================= VALIDATION ================= */
  const validate = () => {
    const e: any = {};

    Object.entries(formData).forEach(([k, v]) => {
      if (!v) e[k] = "Required";
    });

    Object.entries(job).forEach(([k, v]) => {
      if (!v) e[k] = "Required";
    });


    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ================= SUBMIT (SAME FLOW) ================= */
const handleSubmit = async (e: any) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    setLoading(true);

    // ✅ STEP 1: CREATE USER (JSON ONLY)
    await axios.post(
      `${API_BASE}/users`,
      {
        // BASIC
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        dob: formData.dob,
        joiningDate: formData.joiningDate,
        password: formData.password,
        role: formData.role,

        // JOB
        companyId: job.companyId,
        branchId: job.branchId,
        departmentId: job.departmentId,
        designationId: job.designationId,
        managerId: job.managerId,
        employmentType: job.employmentType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("User created successfully");

    setFormData({
      name: "",
      email: "",
      mobile: "",
      gender: "",
      dob: "",
      joiningDate: "",
      password: "",
      role: "",
    });

    setJob({
      companyId: "",
      branchId: "",
      departmentId: "",
      designationId: "",
      managerId: "",
      employmentType: "",
    });



    setErrors({});

    // ✅ CLEAR FILE INPUTS
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Add User</h1>
      {/* ================= BASIC INFORMATION ================= */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Basic Information
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <Label>
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label>
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <Label>
              Mobile <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
              className={errors.mobile ? "border-red-500" : ""}
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className={`w-full h-10 border rounded-md px-3 ${
                errors.gender ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <Label>
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              className={errors.dob ? "border-red-500" : ""}
            />
            {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
          </div>

          {/* Joining Date */}
          <div>
            <Label>
              Joining Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.joiningDate}
              onChange={(e) =>
                setFormData({ ...formData, joiningDate: e.target.value })
              }
              className={errors.joiningDate ? "border-red-500" : ""}
            />
            {errors.joiningDate && (
              <p className="text-sm text-red-500">{errors.joiningDate}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label>
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================= COMPANY & JOB ================= */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Company & Job Details
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company */}
          <div>
            <Label>
              Company <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.companyId}
              onChange={(e) =>
                setJob({
                  ...job,
                  companyId: e.target.value,
                  branchId: "",
                  departmentId: "",
                  designationId: "",
                })
              }
              className={`w-full h-10 border rounded-md px-3 ${
                errors.companyId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="text-sm text-red-500">{errors.companyId}</p>
            )}
          </div>

          {/* Branch */}
          <div>
            <Label>
              Branch <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.branchId}
              disabled={!job.companyId}
              onChange={(e) =>
                setJob({
                  ...job,
                  branchId: e.target.value,
                  departmentId: "",
                  designationId: "",
                })
              }
              className={`w-full h-10 border rounded-md px-3 disabled:bg-gray-100 ${
                errors.branchId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Branch</option>
              {filteredBranches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="text-sm text-red-500">{errors.branchId}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <Label>
              Department <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.departmentId}
              disabled={!job.branchId}
              onChange={(e) =>
                setJob({
                  ...job,
                  departmentId: e.target.value,
                  designationId: "",
                })
              }
              className={`w-full h-10 border rounded-md px-3 disabled:bg-gray-100 ${
                errors.departmentId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-sm text-red-500">{errors.departmentId}</p>
            )}
          </div>

          {/* Designation */}
          <div>
            <Label>
              Designation <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.designationId}
              disabled={!job.departmentId}
              onChange={(e) =>
                setJob({ ...job, designationId: e.target.value })
              }
              className={`w-full h-10 border rounded-md px-3 disabled:bg-gray-100 ${
                errors.designationId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Designation</option>
              {filteredDesignations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.designationId && (
              <p className="text-sm text-red-500">{errors.designationId}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label>
              Role <span className="text-red-500">*</span>
            </Label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className={`w-full h-10 border rounded-md px-3 ${
                errors.role ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Role</option>
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

          {/* Reporting Manager */}
          <div>
            <Label>
              Reporting Manager <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.managerId}
              onChange={(e) => setJob({ ...job, managerId: e.target.value })}
              className={`w-full h-10 border rounded-md px-3 ${
                errors.managerId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Manager</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-sm text-red-500">{errors.managerId}</p>
            )}
          </div>

          {/* Employee Type */}
          <div>
            <Label>
              Employee Type <span className="text-red-500">*</span>
            </Label>
            <select
              value={job.employmentType}
              onChange={(e) =>
                setJob({ ...job, employmentType: e.target.value })
              }
              className={`w-full h-10 border rounded-md px-3 ${
                errors.employmentType ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Intern">Intern</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.employmentType && (
              <p className="text-sm text-red-500">{errors.employmentType}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LEAD MENTOR EXTRA FORM */}
      {formData.role === "leadmentor" && <LeadMentorForm />}


      {/* Tumhara existing Upload Documents section exactly yahin rahega */}
      <div className="flex justify-center pt-6">
        <Button onClick={handleSubmit} disabled={loading}>
          Add User
        </Button>
      </div>
    </div>
  );
}


