/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  User,
  Calendar,
  Briefcase,
  Building2,
  Users,
  Pencil,
  X,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

interface UserType {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  joiningDate: string;
  role: string;
  employmentType: string;
  employmentStatus: "PROBATION" | "CONFIRMED";
  probationEndDate: string;
  companyId?: { name: string };
  branchId?: { name: string };
  departmentId?: { name: string };
  designationId?: { name: string };
  managerId?: { name: string };
}

interface Company {
  _id: string;
  name: string;
}

interface Branch {
  _id: string;
  name: string;
  companyId: { _id: string };
}

interface Department {
  _id: string;
  name: string;
  branchId: { _id: string };
}

interface Designation {
  _id: string;
  name: string;
  departmentId: { _id: string };
}

interface EmployeeMini {
  _id: string;
  name: string;
}


export default function Profile() {
  const token = localStorage.getItem("token");
  const { id: userId } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const [openPersonal, setOpenPersonal] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [openProfileCard, setOpenProfileCard] = useState(false);
  const [openJobInfo, setOpenJobInfo] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [managers, setManagers] = useState<EmployeeMini[]>([]);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    email: "",
    mobile: "",
  });

  const [jobForm, setJobForm] = useState({
    companyId: "",
    branchId: "",
    departmentId: "",
    designationId: "",
    managerId: "",
    employmentType: "",
    employmentStatus: "",
    probationEndDate: "",
  });

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);

      setForm({
        name: res.data.name,
        gender: res.data.gender,
        dob: res.data.dob?.slice(0, 10),
        email: res.data.email,
        mobile: res.data.mobile,
      });

      setJobForm({
        companyId: res.data.companyId?._id || "",
        branchId: res.data.branchId?._id || "",
        departmentId: res.data.departmentId?._id || "",
        designationId: res.data.designationId?._id || "",
        managerId: res.data.managerId?._id || "",
        employmentType: res.data.employmentType,
        employmentStatus: res.data.employmentStatus,
        probationEndDate: res.data.probationEndDate?.slice(0, 10),
      });

    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchCompanies = async () => {
    const res = await axios.get(`${API}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(res.data);
  };

  const fetchBranches = async (companyId: string) => {
    const res = await axios.get(`${API}/branches?companyId=${companyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBranches(res.data);
  };

  const fetchDepartments = async (branchId: string) => {
    const res = await axios.get(`${API}/departments?branchId=${branchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDepartments(res.data);
  };

  const fetchDesignations = async (departmentId: string) => {
    const res = await axios.get(
      `${API}/designations?departmentId=${departmentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setDesignations(res.data);
  };

  const fetchManagers = async () => {
    const res = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setManagers(res.data);
  };

  const updateUser = async (payload: Partial<UserType>) => {
    await axios.patch(`${API}/users/${userId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchManagers();
  }, []);

  useEffect(() => {
    if (jobForm.companyId) fetchBranches(jobForm.companyId);
  }, [jobForm.companyId]);

  useEffect(() => {
    if (jobForm.branchId) fetchDepartments(jobForm.branchId);
  }, [jobForm.branchId]);

  useEffect(() => {
    if (jobForm.departmentId) fetchDesignations(jobForm.departmentId);
  }, [jobForm.departmentId]);


  if (loading)
    return <div className="p-6 text-gray-500">Loading profile...</div>;
  if (!user) return <div className="p-6 text-red-500">User not found</div>;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Personal Information</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ================= LEFT PROFILE CARD ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center sticky top-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold">
              {initials}
            </div>

            <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.employeeId}</p>

            <div className="mt-2 text-sm">
              <p className="font-medium">{user.designationId?.name}</p>
              <p className="text-gray-500">{user.departmentId?.name}</p>
            </div>

            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                user.employmentStatus === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {user.employmentStatus}
            </span>

            <div className="mt-4 text-xs text-gray-500">
              Joined on{" "}
              <span className="font-medium text-gray-700">
                {new Date(user.joiningDate).toDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT DETAILS ================= */}
        <div className="lg:col-span-3 space-y-6">
          <Section
            title="Personal Details"
            onEdit={() => setOpenPersonal(true)}
          >
            <Info label="Full Name" value={user.name} icon={<User />} />
            <Info label="Gender" value={user.gender} />
            <Info
              label="Date of Birth"
              value={new Date(user.dob).toDateString()}
              icon={<Calendar />}
            />
          </Section>

          <Section
            title="Contact Information"
            onEdit={() => setOpenContact(true)}
          >
            <Info label="Email" value={user.email} icon={<Mail />} />
            <Info label="Mobile" value={user.mobile} icon={<Phone />} />
          </Section>

          <Section title="Job Information" onEdit={() => setOpenJobInfo(true)}>
            <Info
              label="Company"
              value={user.companyId?.name}
              icon={<Building2 />}
            />
            <Info label="Branch" value={user.branchId?.name} />
            <Info label="Department" value={user.departmentId?.name} />
            <Info
              label="Designation"
              value={user.designationId?.name}
              icon={<Briefcase />}
            />
            <Info
              label="Manager"
              value={user.managerId?.name || "—"}
              icon={<Users />}
            />
            <Info label="Employment Type" value={user.employmentType} />
            <Info
              label="Probation Ends"
              value={new Date(user.probationEndDate).toDateString()}
            />
          </Section>
        </div>
      </div>

      {/* ================= PROFILE CARD MODAL ================= */}
      {openProfileCard && (
        <Modal title="Edit Profile" onClose={() => setOpenProfileCard(false)}>
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
          />
          <ModalActions
            onSave={() => {
              updateUser({ name: form.name });
              setOpenProfileCard(false);
            }}
            onCancel={() => setOpenProfileCard(false)}
          />
        </Modal>
      )}

      {/* ================= PERSONAL MODAL ================= */}
      {openPersonal && (
        <Modal
          title="Edit Personal Details"
          onClose={() => setOpenPersonal(false)}
        >
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Gender"
            value={form.gender}
            onChange={(e: any) => setForm({ ...form, gender: e.target.value })}
          />
          <Input
            type="date"
            label="Date of Birth"
            value={form.dob}
            onChange={(e: any) => setForm({ ...form, dob: e.target.value })}
          />
          <ModalActions
            onSave={() => {
              updateUser({
                name: form.name,
                gender: form.gender,
                dob: form.dob,
              });
              setOpenPersonal(false);
            }}
            onCancel={() => setOpenPersonal(false)}
          />
        </Modal>
      )}

      {/* ================= CONTACT MODAL ================= */}
      {openContact && (
        <Modal
          title="Edit Contact Information"
          onClose={() => setOpenContact(false)}
        >
          <Input
            label="Email"
            value={form.email}
            onChange={(e: any) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(e: any) => setForm({ ...form, mobile: e.target.value })}
          />
          <ModalActions
            onSave={() => {
              updateUser({ email: form.email, mobile: form.mobile });
              setOpenContact(false);
            }}
            onCancel={() => setOpenContact(false)}
          />
        </Modal>
      )}

      {/* ================= JOB INFO MODAL ================= */}
      {openJobInfo && (
        <Modal
          title="Edit Job Information"
          onClose={() => setOpenJobInfo(false)}
        >
          {/* Company */}
          <Select
            label="Company"
            value={jobForm.companyId}
            onChange={(e: any) =>
              setJobForm({
                ...jobForm,
                companyId: e.target.value,
                branchId: "",
                departmentId: "",
                designationId: "",
              })
            }
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>

          {/* Branch */}
          <Select
            label="Branch"
            value={jobForm.branchId}
            onChange={(e: any) =>
              setJobForm({
                ...jobForm,
                branchId: e.target.value,
                departmentId: "",
                designationId: "",
              })
            }
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </Select>

          {/* Department */}
          <Select
            label="Department"
            value={jobForm.departmentId}
            onChange={(e: any) =>
              setJobForm({
                ...jobForm,
                departmentId: e.target.value,
                designationId: "",
              })
            }
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>

          {/* Designation */}
          <Select
            label="Designation"
            value={jobForm.designationId}
            onChange={(e: any) =>
              setJobForm({ ...jobForm, designationId: e.target.value })
            }
          >
            <option value="">Select Designation</option>
            {designations.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>

          {/* Manager */}
          <Select
            label="Manager"
            value={jobForm.managerId}
            onChange={(e: any) =>
              setJobForm({ ...jobForm, managerId: e.target.value })
            }
          >
            <option value="">Select Manager</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </Select>

          <Select
            label="Employment Type"
            value={jobForm.employmentType}
            onChange={(e: any) =>
              setJobForm({ ...jobForm, employmentType: e.target.value })
            }
          >
            <option value="">Select Employment Type</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Intern">Intern</option>
            <option value="Contract">Contract</option>
          </Select>

          <Select
            label="Employment Status"
            value={jobForm.employmentStatus}
            onChange={(e: any) =>
              setJobForm({ ...jobForm, employmentStatus: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="PROBATION">PROBATION</option>
            <option value="CONFIRMED">CONFIRMED</option>
          </Select>

          <Input
            type="date"
            label="Probation End Date"
            value={jobForm.probationEndDate}
            onChange={(e: any) =>
              setJobForm({ ...jobForm, probationEndDate: e.target.value })
            }
          />

          <ModalActions
            onSave={() => {
              updateUser({
                companyId: jobForm.companyId as any,
                branchId: jobForm.branchId as any,
                departmentId: jobForm.departmentId as any,
                designationId: jobForm.designationId as any,
                managerId: jobForm.managerId as any,
                employmentType: jobForm.employmentType,
                employmentStatus: jobForm.employmentStatus as any,
                probationEndDate: jobForm.probationEndDate,
              });
              setOpenJobInfo(false);
            }}
            onCancel={() => setOpenJobInfo(false)}
          />
        </Modal>
      )}
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */

const Section = ({ title, children, onEdit }: any) => (
  <div className="bg-white border rounded-xl shadow-sm p-5 relative">
    <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
      {title}
    </h3>
    {onEdit && (
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
      >
        <Pencil size={16} />
      </button>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Info = ({ label, value, icon }: any) => (
  <div className="flex items-start gap-3">
    {icon && <div className="mt-1 text-gray-400">{icon}</div>}
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  </div>
);

const Modal = ({ title, children, onClose }: any) => (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    onClick={onClose}
  >
    <div
      className="bg-white w-full max-w-md rounded-xl relative flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="px-6 py-4 overflow-y-auto flex-1">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  </div>
);


const Input = ({ label, ...props }: any) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <input
      {...props}
      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
    />
  </div>
);

const ModalActions = ({ onSave, onCancel }: any) => (
  <div className="flex justify-end gap-2 pt-4">
    <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-md">
      Cancel
    </button>
    <button
      onClick={onSave}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
    >
      Save
    </button>
  </div>
);
const Select = ({ label, children, ...props }: any) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <select
      {...props}
      className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white"
    >
      {children}
    </select>
  </div>
);
