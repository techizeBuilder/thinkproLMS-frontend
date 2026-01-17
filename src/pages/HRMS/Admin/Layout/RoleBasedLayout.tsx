/** @format */

import { Outlet } from "react-router-dom";
import HRMSManagerLayout from "./HRMSManagerLayout";
import HRMSEmployeeLayout from "./HRMSEmployeeLayout";
import { useAuth } from "@/contexts/AuthContext";
import HRMSFinanceManagerLayout from "./HRMSFinanceLayout";
import HRMSITAdminLayout from "./HRMSITAdminLayout";
import HRMSAdminLayout from "./HRMSAdminLayout";
import SuperAdminLayout from "../Layout";
import HRMSAuditorLayout from "./HRMSAuditorLayout";

export default function RoleBasedLayout() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "superadmin":
      return (
        <SuperAdminLayout>
          <Outlet />
        </SuperAdminLayout>
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
    case "Admin":
      return (
        <HRMSAdminLayout>
          <Outlet />
        </HRMSAdminLayout>
      );
    case "auditor":
      return (
        <HRMSAuditorLayout>
          <Outlet />
        </HRMSAuditorLayout>
      );
    default:
      return <div>Unauthorized</div>;
  }
}
