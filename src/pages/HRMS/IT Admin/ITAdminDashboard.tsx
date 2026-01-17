/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Boxes,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  Laptop,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface User {
  _id: string;
}

interface Asset {
  status: string;
}

interface License {
  status: string;
}

interface OnboardingTask {
  status: string;
}

/* ================= CARD ================= */

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  bg: string;
}

const StatCard = ({ title, value, icon: Icon, bg }: StatCardProps) => (
  <div className="bg-white border rounded-2xl p-6 relative shadow-sm hover:shadow-md transition">
    <div className={`absolute right-5 top-5 p-2 rounded-full ${bg}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <p className="text-sm text-gray-500">{title}</p>
    <h2 className="text-3xl font-semibold mt-3">{value}</h2>
  </div>
);

/* ================= DASHBOARD ================= */

export default function ITAdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingTask[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, assetRes, licenseRes, onboardingRes] = await Promise.all([
        axios.get(`${API}/users`, { headers }),
        axios.get(`${API}/asset`, { headers }),
        axios.get(`${API}/license/assigned`, { headers }),
        axios.get(`${API}/onboarding-tasks`, { headers }),
      ]);

      setUsers(userRes.data || []);
      setAssets(assetRes.data || []);
      setLicenses(licenseRes.data || []);
      setOnboarding(onboardingRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATIONS ================= */

  const totalUsers = users.length;

  const totalAssets = assets.length;
  const assignedAssets = assets.filter((a) => a.status === "ASSIGNED").length;

  const totalLicenses = licenses.length;
  const pendingLicenses = licenses.filter((l) => l.status !== "ACTIVE").length;

  const totalOnboarding = onboarding.length;
  const pendingOnboarding = onboarding.filter(
    (o) => o.status === "PENDING"
  ).length;

  if (loading) return <div className="p-6">Loading IT Dashboard...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">IT Admin Dashboard</h1>
        <p className="text-sm text-gray-500">
          System access, assets & onboarding overview
        </p>
      </div>

      {/* ================= TOP STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalUsers}
          icon={Users}
          bg="bg-indigo-500"
        />

        <StatCard
          title="Total Assets"
          value={totalAssets}
          icon={Boxes}
          bg="bg-blue-500"
        />

        <StatCard
          title="Active Licenses"
          value={totalLicenses}
          icon={ShieldCheck}
          bg="bg-green-500"
        />

        <StatCard
          title="Pending Onboarding"
          value={pendingOnboarding}
          icon={UserPlus}
          bg="bg-orange-500"
        />
      </div>

      {/* ================= SECOND ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Assets"
          value={assignedAssets}
          icon={Laptop}
          bg="bg-purple-500"
        />

        <StatCard
          title="Pending Licenses"
          value={pendingLicenses}
          icon={AlertTriangle}
          bg="bg-red-500"
        />

        <StatCard
          title="Total Onboarding Tasks"
          value={totalOnboarding}
          icon={UserPlus}
          bg="bg-yellow-500"
        />
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="IT Onboarding Tasks"
            color="bg-blue-50 text-blue-600 hover:bg-blue-100"
            onClick={() => navigate("/hrms/it/onboarding")}
          />

          <QuickAction
            title="Asset Inventory"
            color="bg-green-50 text-green-600 hover:bg-green-100"
            onClick={() => navigate("/hrms/it/assets")}
          />

          <QuickAction
            title="Assign / Reassign Asset"
            color="bg-purple-50 text-purple-600 hover:bg-purple-100"
            onClick={() => navigate("/hrms/it/assets/assign")}
          />

          <QuickAction
            title="Software Licenses"
            color="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            onClick={() => navigate("/hrms/it/software")}
          />

          <QuickAction
            title="Access Deactivation"
            color="bg-red-50 text-red-600 hover:bg-red-100"
            onClick={() => navigate("/hrms/it/offboarding/access")}
          />

          <QuickAction
            title="Asset Return Clearance"
            color="bg-orange-50 text-orange-600 hover:bg-orange-100"
            onClick={() => navigate("/hrms/it/offboarding/assets")}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= QUICK ACTION ================= */

function QuickAction({
  title,
  onClick,
  color,
}: {
  title: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-xl font-medium transition ${color}`}
    >
      {title}
    </div>
  );
}
