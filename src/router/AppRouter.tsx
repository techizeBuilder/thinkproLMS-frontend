import type { JSX } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Setup from "../pages/Auth/Setup";
import SuperAdmin from "../pages/Dashboard/SuperAdmin";
import Admin from "../pages/Dashboard/Admin";
import LeadMentor from "../pages/Dashboard/LeadMentor";
import AdminsPage from "../pages/Dashboard/SuperAdmin/Admins";
import CreateAdminPage from "../pages/Dashboard/SuperAdmin/Admins/Create";

// School Management Components
import SchoolsPage from "../pages/Dashboard/SuperAdmin/Schools";
import CreateSchoolPage from "../pages/Dashboard/SuperAdmin/Schools/Create";
import EditSchoolPage from "../pages/Dashboard/SuperAdmin/Schools/Edit";
import SchoolAdminsPage from "../pages/Dashboard/SuperAdmin/SchoolAdmins";
import CreateSchoolAdminPage from "../pages/Dashboard/SuperAdmin/SchoolAdmins/Create";
import EditSchoolAdminPage from "../pages/Dashboard/SuperAdmin/SchoolAdmins/Edit";
import LeadMentorsPage from "../pages/Dashboard/SuperAdmin/LeadMentors";
import CreateLeadMentorPage from "../pages/Dashboard/SuperAdmin/LeadMentors/Create";
import EditLeadMentorPage from "../pages/Dashboard/SuperAdmin/LeadMentors/Edit";

// LeadMentor Edit Components (re-exported from SuperAdmin)
import LeadMentorEditSchoolAdminPage from "../pages/Dashboard/LeadMentor/SchoolAdmins/Edit";
import LeadMentorEditLeadMentorPage from "../pages/Dashboard/LeadMentor/LeadMentors/Edit";

// Dashboard Components
import SuperAdminDashboard from "../pages/Dashboard/SuperAdmin/Dashboard";
import LeadMentorDashboard from "../pages/Dashboard/LeadMentor/Dashboard";
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
  if (role && user.role !== role)
    return <Navigate to={`/${user.role}`} replace />;
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
          <Route index element={<SuperAdminDashboard />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<CreateAdminPage />} />
          
          {/* School Management Routes */}
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/create" element={<CreateSchoolPage />} />
          <Route path="schools/:id/edit" element={<EditSchoolPage />} />
          
          <Route path="school-admins" element={<SchoolAdminsPage />} />
          <Route path="school-admins/create" element={<CreateSchoolAdminPage />} />
          <Route path="school-admins/:id/edit" element={<EditSchoolAdminPage />} />
          
          <Route path="lead-mentors" element={<LeadMentorsPage />} />
          <Route path="lead-mentors/create" element={<CreateLeadMentorPage />} />
          <Route path="lead-mentors/:id/edit" element={<EditLeadMentorPage />} />
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

        {/* Lead Mentor */}
        <Route
          path="/leadmentor"
          element={
            <ProtectedRoute role="leadmentor">
              <LeadMentor />
            </ProtectedRoute>
          }
        >
          <Route index element={<LeadMentorDashboard />} />
          <Route path="school-admins" element={<SchoolAdminsPage />} />
          <Route path="school-admins/create" element={<CreateSchoolAdminPage />} />
          <Route path="school-admins/:id/edit" element={<LeadMentorEditSchoolAdminPage />} />
          <Route path="lead-mentors" element={<LeadMentorsPage />} />
          <Route path="lead-mentors/create" element={<CreateLeadMentorPage />} />
          <Route path="lead-mentors/:id/edit" element={<LeadMentorEditLeadMentorPage />} />
        </Route>

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
        <Route
          path="*"
          element={
            <div>
              <h1 className="text-3xl font-bold">404 - Not Found</h1>
              <p className="mt-4">
                The page you are looking for does not exist.
              </p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
