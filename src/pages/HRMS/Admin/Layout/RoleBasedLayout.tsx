/** @format */

import { Outlet } from "react-router-dom";
import HRMSAdminLayout from "../Layout";
import HRMSManagerLayout from "./HRMSManagerLayout";
import { useAuth } from "@/contexts/AuthContext";

export default function RoleBasedLayout() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
    case "superadmin":
      return (
        <HRMSAdminLayout>
          <Outlet />
        </HRMSAdminLayout>
      );

    case "manager":
      return (
        <HRMSManagerLayout>
          <Outlet />
        </HRMSManagerLayout>
      );

    default:
      return <div>Unauthorized</div>;
  }
}
