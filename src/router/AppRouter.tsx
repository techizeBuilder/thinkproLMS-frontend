import type { JSX } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Setup from "../pages/Auth/Setup";
import GuestLogin from "../pages/Auth/GuestLogin";
import GuestRegister from "../pages/Auth/GuestRegister";
import NotFound from "../pages/NotFound";
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
import SuperAdminMentorsPage from "../pages/Dashboard/SuperAdmin/Mentors";
import CreateSuperAdminMentorPage from "../pages/Dashboard/SuperAdmin/Mentors/Create";
import EditSuperAdminMentorPage from "../pages/Dashboard/SuperAdmin/Mentors/Edit";

// LeadMentor Edit Components (re-exported from SuperAdmin)
import LeadMentorEditSchoolAdminPage from "../pages/Dashboard/LeadMentor/SchoolAdmins/Edit";
import LeadMentorEditLeadMentorPage from "../pages/Dashboard/LeadMentor/LeadMentors/Edit";

// LeadMentor Mentor & Student Management
import MentorsPage from "../pages/Dashboard/LeadMentor/Mentors";
import CreateMentorPage from "../pages/Dashboard/LeadMentor/Mentors/Create";
import StudentsPage from "../pages/Dashboard/LeadMentor/Students";
import CreateStudentPage from "../pages/Dashboard/LeadMentor/Students/Create";
import EditStudentPage from "../pages/Dashboard/LeadMentor/Students/Edit";
import BulkUploadStudentsPage from "../pages/Dashboard/LeadMentor/Students/BulkUpload";
import PromoteGradePage from "../pages/Dashboard/LeadMentor/Students/Promote";
import QuestionBankPage from "../pages/Dashboard/LeadMentor/QuestionBank";
import SubjectsPage from "../pages/Dashboard/Subjects";
import ModulesPage from "../pages/Dashboard/Modules";
import CreateModulePage from "../pages/Dashboard/Modules/Create";
import EditModulePage from "../pages/Dashboard/Modules/Edit";
import { ProtectedRoute as PermissionProtectedRoute } from "../components/ProtectedRoute";

// Resources Management Components
import ResourcesPage from "../pages/Dashboard/Resources";
import AddResourcePage from "../pages/Dashboard/Resources/Add";
import EditResourcePage from "../pages/Dashboard/Resources/Edit";
import ViewResourcePage from "../pages/Dashboard/Resources/View";
import StudentResourcesPage from "../pages/Dashboard/Student/Resources";
import StudentResourceViewPage from "../pages/Dashboard/Student/ResourceView";
import MentorLayout from "../pages/Dashboard/Mentor/Layout";
import MentorDashboard from "../pages/Dashboard/Mentor/Dashboard";
import MentorResourcesPage from "../pages/Dashboard/Mentor/Resources";
import MentorResourceViewPage from "../pages/Dashboard/Mentor/ResourceView";
import MentorStudentsPage from "../pages/Dashboard/Mentor/Students";
import MentorQuestionBankPage from "../pages/Dashboard/Mentor/QuestionBank";

// Assessment Components
import MentorAssessmentsPage from "../pages/Dashboard/Mentor/Assessments";
import CreateAssessmentPage from "../pages/Dashboard/Mentor/Assessments/Create";
import ViewAssessmentPage from "../pages/Dashboard/Mentor/Assessments/View";
import EditAssessmentPage from "../pages/Dashboard/Mentor/Assessments/Edit";
import AssessmentAnalyticsPage from "../pages/Dashboard/Mentor/Assessments/Analytics";
import StudentAssessmentsPage from "../pages/Dashboard/Student/Assessments";
import TakeAssessmentPage from "../pages/Dashboard/Student/Assessments/TakeAssessment";
import StudentAssessmentResultsPage from "../pages/Dashboard/Student/Assessments/Results";
import StudentDashboard from "../pages/Dashboard/Student/Dashboard";

// Dashboard Components
import SuperAdminDashboard from "../pages/Dashboard/SuperAdmin/Dashboard";
import LeadMentorDashboard from "../pages/Dashboard/LeadMentor/Dashboard";
import Student from "../pages/Dashboard/Student";

// Guest Components
import GuestLayout from "../components/Guest/GuestLayout";
import GuestHome from "../pages/Guest/GuestHome";
import GuestResources from "../pages/Guest/GuestResources";
import GuestQuizzes from "../pages/Guest/GuestQuizzes";
import GuestClasses from "../pages/Guest/GuestClasses";
import GuestPremium from "../pages/Guest/GuestPremium";

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
  
  if (role && user.role !== role) {
    // Special case: allow schooladmin to access admin routes
    if (role === "admin" && user.role === "schooladmin") {
      return children;
    }
    
    // Map roles to their appropriate routes for redirection
    const roleRouteMap: { [key: string]: string } = {
      superadmin: "/superadmin",
      leadmentor: "/leadmentor", 
      schooladmin: "/admin",
      admin: "/admin",
      mentor: "/mentor",
      student: "/student",
      guest: "/guest"
    };
    
    const route = roleRouteMap[user.role] || "/login";
    return <Navigate to={route} replace />;
  }
  
  return children;
}

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to user's role-based dashboard
  // Map schooladmin to admin since they share the same dashboard
  const roleRouteMap: { [key: string]: string } = {
    superadmin: "/superadmin",
    leadmentor: "/leadmentor", 
    schooladmin: "/admin",
    admin: "/admin",
    mentor: "/mentor",
    student: "/student",
    guest: "/guest"
  };

  const route = roleRouteMap[user.role] || "/login";
  return <Navigate to={route} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route - Authentication Check */}
        <Route path="/" element={<RootRoute />} />
        
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup/:token" element={<Setup />} />
        <Route path="/guest/login" element={<GuestLogin />} />
        <Route path="/guest/register" element={<GuestRegister />} />

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
          
          {/* Mentor Management */}
          <Route path="mentors" element={<SuperAdminMentorsPage />} />
          <Route path="mentors/create" element={<CreateSuperAdminMentorPage />} />
          <Route path="mentors/:id/edit" element={<EditSuperAdminMentorPage />} />
          
          {/* Student Management */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />
          <Route path="students/bulk-upload" element={<BulkUploadStudentsPage />} />
          <Route path="students/promote" element={<PromoteGradePage />} />
          
          {/* Question Bank */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          
          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route path="assessments/:id/analytics" element={<AssessmentAnalyticsPage />} />
          
          {/* Resources Management */}
          <Route 
            path="resources" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <ResourcesPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/add" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <AddResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/:id/edit" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <EditResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/:id/view" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <ViewResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          
          {/* Resource & Modules Management */}
          <Route 
            path="subjects" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <SubjectsPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <ModulesPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules/create" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <CreateModulePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules/:id/edit" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <EditModulePage />
              </PermissionProtectedRoute>
            } 
          />
        </Route>

        {/* Admin & School Admin */}
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
          
          {/* Mentor Management */}
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          
          {/* Student Management */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />
          <Route path="students/bulk-upload" element={<BulkUploadStudentsPage />} />
          <Route path="students/promote" element={<PromoteGradePage />} />
          
          {/* Question Bank */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          
          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route path="assessments/:id/analytics" element={<AssessmentAnalyticsPage />} />
          
          {/* Resources Management */}
          <Route 
            path="resources" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <ResourcesPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/add" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <AddResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/:id/edit" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <EditResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="resources/:id/view" 
            element={
              <PermissionProtectedRoute requiredPermission="add_resources">
                <ViewResourcePage />
              </PermissionProtectedRoute>
            } 
          />
          
          {/* Resource & Modules Management */}
          <Route 
            path="subjects" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <SubjectsPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <ModulesPage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules/create" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <CreateModulePage />
              </PermissionProtectedRoute>
            } 
          />
          <Route 
            path="modules/:id/edit" 
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <EditModulePage />
              </PermissionProtectedRoute>
            } 
          />
        </Route>

        {/* Mentor */}
        <Route
          path="/mentor"
          element={
            <ProtectedRoute role="mentor">
              <MentorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MentorDashboard />} />
          <Route path="students" element={<MentorStudentsPage />} />
          <Route path="resources" element={<MentorResourcesPage />} />
          <Route path="resources/:id/view" element={<MentorResourceViewPage />} />
          
          {/* Question Bank */}
          <Route path="question-bank" element={<MentorQuestionBankPage />} />
          
          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route path="assessments/:id/analytics" element={<AssessmentAnalyticsPage />} />
        </Route>

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Student />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="resources" element={<StudentResourcesPage />} />
          <Route path="resources/:id/view" element={<StudentResourceViewPage />} />
          
          {/* Assessment Routes */}
          <Route path="assessments" element={<StudentAssessmentsPage />} />
          <Route path="assessments/:id/take" element={<TakeAssessmentPage />} />
          <Route path="assessments/results" element={<StudentAssessmentResultsPage />} />
        </Route>

        {/* Guest */}
        <Route
          path="/guest"
          element={
            <ProtectedRoute role="guest">
              <GuestLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GuestHome />} />
          <Route path="resources" element={<GuestResources />} />
          <Route path="quizzes" element={<GuestQuizzes />} />
          <Route path="classes" element={<GuestClasses />} />
          <Route path="premium" element={<GuestPremium />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
