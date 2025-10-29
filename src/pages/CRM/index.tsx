import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CRMSuperAdminLayout from "./SuperAdmin/Layout";
import SalesManagersPage from "./SuperAdmin/SalesManagers";
import SalesExecutivesPage from "./SuperAdmin/SalesExecutives";
import AddSalesManagerPage from "./SuperAdmin/SalesManagers/Add";
import AddSalesExecutivePage from "./SuperAdmin/SalesExecutives/Add";

export default function CRM() {
  const { user } = useAuth();
  const location = useLocation();

  // Redirect based on user role
  if (user?.role === "superadmin" && location.pathname === "/crm/superadmin") {
    return <Navigate to="/crm/superadmin/sales-managers" replace />;
  }

  // Handle different role-based layouts
  if (user?.role === "superadmin") {
    return (
      <CRMSuperAdminLayout>
        <Routes>
          <Route index element={<Navigate to="sales-managers" replace />} />
          <Route path="sales-managers" element={<SalesManagersPage />} />
          <Route path="sales-managers/add" element={<AddSalesManagerPage />} />
          <Route path="sales-executives" element={<SalesExecutivesPage />} />
          <Route path="sales-executives/add" element={<AddSalesExecutivePage />} />
        </Routes>
      </CRMSuperAdminLayout>
    );
  }

  // Placeholder for other roles
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">CRM</h1>
      <p className="mt-2 text-gray-600">This is the CRM area. Coming soon.</p>
    </div>
  );
}


