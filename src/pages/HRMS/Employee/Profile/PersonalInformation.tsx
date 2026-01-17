/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
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

export default function PersonalInformation() {
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = loggedInUser?.id;

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const [openPersonal, setOpenPersonal] = useState(false);
  const [openContact, setOpenContact] = useState(false);

  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    email: "",
    mobile: "",
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
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
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
          {/* -------- Personal Details -------- */}
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

          {/* -------- Contact Information -------- */}
          <Section
            title="Contact Information"
            onEdit={() => setOpenContact(true)}
          >
            <Info label="Email" value={user.email} icon={<Mail />} />
            <Info label="Mobile" value={user.mobile} icon={<Phone />} />
          </Section>

          {/* -------- Job Information -------- */}
          <Section title="Job Information">
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

      {/* ================= PERSONAL MODAL ================= */}
      {openPersonal && (
        <Modal
          title="Edit Personal Details"
          onClose={() => setOpenPersonal(false)}
        >
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e:any) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Gender"
            value={form.gender}
            onChange={(e:any) => setForm({ ...form, gender: e.target.value })}
          />
          <Input
            type="date"
            label="Date of Birth"
            value={form.dob}
            onChange={(e:any) => setForm({ ...form, dob: e.target.value })}
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
            onChange={(e:any) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(e:any) => setForm({ ...form, mobile: e.target.value })}
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
    </div>
  );
}

/* ================= COMPONENTS ================= */

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
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={onClose} // 👈 outside click
  >
    <div
      className="bg-white w-full max-w-md rounded-xl p-6 relative"
      onClick={(e) => e.stopPropagation()} // 👈 inside click stop
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400"
      >
        <X size={18} />
      </button>

      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
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
