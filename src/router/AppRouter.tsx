import type { JSX } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Setup from "../pages/Auth/Setup";
import SuperAdmin from "../pages/Dashboard/SuperAdmin";
import Admin from "../pages/Dashboard/Admin";
import AdminsPage from "../pages/Dashboard/SuperAdmin/Admins";
import CreateAdminPage from "../pages/Dashboard/SuperAdmin/Admins/Create";
// import Student from "../pages/Dashboard/Student";
// import Mentor from "../pages/Dashboard/Mentor";

function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: string;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup/:token" element={<Setup />} />

        {/* SuperAdmin */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute role="superadmin">
              <SuperAdmin />
            </ProtectedRoute>
          }
        >
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<CreateAdminPage />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Mentor */}
        {/* <Route
          path="/mentor"
          element={
            <ProtectedRoute role="mentor">
              <Mentor />
            </ProtectedRoute>
          }
        /> */}

        {/* Student */}
        {/* <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Student />
            </ProtectedRoute>
          }
        /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
