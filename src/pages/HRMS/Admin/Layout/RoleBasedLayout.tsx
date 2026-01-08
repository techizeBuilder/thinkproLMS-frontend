/** @format */

import { Outlet } from "react-router-dom";
import HRMSAdminLayout from "../Layout";
import HRMSManagerLayout from "./HRMSManagerLayout";
import HRMSEmployeeLayout from "./HRMSEmployeeLayout";
import { useAuth } from "@/contexts/AuthContext";
import HRMSFinanceManagerLayout from "./HRMSFinanceLayout";
import HRMSITAdminLayout from "./HRMSITAdminLayout";

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

    case "mentor":
      return (
        <HRMSEmployeeLayout>
          <Outlet />
        </HRMSEmployeeLayout>
      );

    case "finance":
      return (
        <HRMSFinanceManagerLayout>
          <Outlet />
        </HRMSFinanceManagerLayout>
      );

    case "IT-Admin":
      return (
        <HRMSITAdminLayout>
          <Outlet />
        </HRMSITAdminLayout>
      );
    default:
      return <div>Unauthorized</div>;
  }
}
