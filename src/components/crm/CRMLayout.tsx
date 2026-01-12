/** @format */

import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import CRMSuperAdminLayout from "@/pages/CRM/SuperAdmin/Layout";
import CRMSalesManagerLayout from "@/pages/CRM/SalesManager/Layout";
import CRMSalesExecutiveLayout from "@/pages/CRM/SalesExecutive/Layout";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMLayout() {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  let LayoutComponent = null;

  if (role === "superadmin") LayoutComponent = CRMSuperAdminLayout;
  else if (role === "sales-manager") LayoutComponent = CRMSalesManagerLayout;
  else if (role === "sales-executive")
    LayoutComponent = CRMSalesExecutiveLayout;

  if (!LayoutComponent) return null;

  return (
    <SidebarProvider defaultCollapsed={false}>
      <LayoutComponent>
        <Outlet />
      </LayoutComponent>
    </SidebarProvider>
  );
}
