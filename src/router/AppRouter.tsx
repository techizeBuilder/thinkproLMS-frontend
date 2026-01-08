import type { JSX } from "react";
import { useAuth } from "../contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";
import Setup from "../pages/Auth/Setup";
import ResetPassword from "../pages/Auth/ResetPassword";
import GuestLogin from "../pages/Auth/GuestLogin";
import GuestRegister from "../pages/Auth/GuestRegister";
import NotFound from "../pages/NotFound";
import SuperAdmin from "../pages/Dashboard/SuperAdmin";
import CRMSuperAdminLayout from "../pages/CRM/SuperAdmin/Layout";
import CRMSalesManagerLayout from "../pages/CRM/SalesManager/Layout";
import CRMSalesExecutiveLayout from "../pages/CRM/SalesExecutive/Layout";
import CRMSummaryPage from "../pages/CRM/Summary";
import SESalesLeadsPage from "../pages/CRM/SalesExecutive/Leads";
import SEAddLeadPage from "../pages/CRM/SalesExecutive/Leads/Add";
import SEEditLeadPage from "../pages/CRM/SalesExecutive/Leads/Edit";
import CRMNotificationsPage from "../pages/CRM/Notifications";
import SalesManagersPage from "../pages/CRM/SuperAdmin/SalesManagers";
import AddSalesManagerPage from "../pages/CRM/SuperAdmin/SalesManagers/Add";
import SalesExecutivesPage from "../pages/CRM/SuperAdmin/SalesExecutives";
import AddSalesExecutivePage from "../pages/CRM/SuperAdmin/SalesExecutives/Add";
import SMSalesExecutivesPage from "../pages/CRM/SalesManager/SalesExecutives";
import SMSalesLeadsPage from "../pages/CRM/SalesManager/Leads";
import SMAddLeadPage from "../pages/CRM/SalesManager/Leads/Add";
import SMEditLeadPage from "../pages/CRM/SalesManager/Leads/Edit";
import SMAddSalesExecutivePage from "../pages/CRM/SalesManager/SalesExecutives/Add";
import SMEditSalesExecutivePage from "../pages/CRM/SalesManager/SalesExecutives/Edit";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import EditSalesManagerPage from "../pages/CRM/SuperAdmin/SalesManagers/Edit";
import EditSalesExecutivePage from "../pages/CRM/SuperAdmin/SalesExecutives/Edit";
import SASalesLeadsPage from "../pages/CRM/SuperAdmin/Leads";
import SAAddLeadPage from "../pages/CRM/SuperAdmin/Leads/Add";
import SAEditLeadPage from "../pages/CRM/SuperAdmin/Leads/Edit";
import Admin from "../pages/Dashboard/Admin";
import LeadMentor from "../pages/Dashboard/LeadMentor";
import SchoolAdmin from "../pages/Dashboard/SchoolAdmin";
import SchoolAdminDashboard from "../pages/Dashboard/SchoolAdmin/Dashboard";
import SchoolAdminMentorsPage from "../pages/Dashboard/SchoolAdmin/Mentors";
import SchoolAdminStudentsPage from "../pages/Dashboard/SchoolAdmin/Students";
import SchoolAdminSessionProgressPage from "../pages/Dashboard/SchoolAdmin/SessionProgress";
import SchoolAdminSchoolsPage from "../pages/Dashboard/SchoolAdmin/Schools";
import SchoolAdminSettingsPage from "../pages/Dashboard/SchoolAdmin/Settings";
import SchoolAdminAssessmentReportsPage from "../pages/Dashboard/SchoolAdmin/AssessmentReports";
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
import SuperAdminSessionProgressPage from "../pages/Dashboard/SuperAdmin/SessionProgress";
import ActivityLogsPage from "../pages/Dashboard/SuperAdmin/ActivityLogs";
import SuperAdminAssessmentReportsPage from "../pages/Dashboard/SuperAdmin/AssessmentReports";
import AccessReportsPage from "../pages/Dashboard/Reports/AccessReports";

// LeadMentor Edit Components (re-exported from SuperAdmin)
import LeadMentorEditSchoolAdminPage from "../pages/Dashboard/LeadMentor/SchoolAdmins/Edit";
import LeadMentorSchoolsPage from "../pages/Dashboard/LeadMentor/Schools";

// LeadMentor Mentor & Student Management
import MentorsPage from "../pages/Dashboard/LeadMentor/Mentors";
import CreateMentorPage from "../pages/Dashboard/LeadMentor/Mentors/Create";
import EditMentorPage from "../pages/Dashboard/LeadMentor/Mentors/Edit";
import StudentsPage from "../pages/Dashboard/LeadMentor/Students";
import CreateStudentPage from "../pages/Dashboard/LeadMentor/Students/Create";
import EditStudentPage from "../pages/Dashboard/LeadMentor/Students/Edit";
import BulkUploadStudentsPage from "../pages/Dashboard/LeadMentor/Students/BulkUpload";
import PromoteGradePage from "../pages/Dashboard/LeadMentor/Students/Promote";
import QuestionBankPage from "../pages/Dashboard/LeadMentor/QuestionBank";
import AddQuestionPage from "../pages/Dashboard/LeadMentor/QuestionBank/AddQuestion";
import ViewRecommendationsPage from "../pages/Dashboard/LeadMentor/QuestionBank/ViewRecommendations";
import BulkUploadPage from "../pages/Dashboard/LeadMentor/QuestionBank/BulkUpload";
import LeadMentorSessionProgressPage from "../pages/Dashboard/LeadMentor/SessionProgress";
import LeadMentorAssessmentReportsPage from "../pages/Dashboard/LeadMentor/AssessmentReports";
import ModulesPage from "../pages/Dashboard/Modules/index";
import CreateModulePage from "../pages/Dashboard/Modules/Create";
import EditModulePage from "../pages/Dashboard/Modules/Edit";
import SessionsPage from "../pages/Dashboard/Sessions";
import CreateSessionPage from "../pages/Dashboard/Sessions/Create";
import EditSessionPage from "../pages/Dashboard/Sessions/Edit";
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
import AddRecommendationPage from "../pages/Dashboard/Mentor/QuestionBank/AddRecommendation";
import MyRecommendationsPage from "../pages/Dashboard/Mentor/QuestionBank/MyRecommendations";

// Notification Components
import LeadMentorNotifications from "../pages/Dashboard/LeadMentor/Notifications";
import SuperAdminNotifications from "../pages/Dashboard/SuperAdmin/Notifications";
import MentorNotifications from "../pages/Dashboard/Mentor/Notifications";

// Assessment Components
import MentorAssessmentsPage from "../pages/Dashboard/Mentor/Assessments";
import CreateAssessmentPage from "../pages/Dashboard/Mentor/Assessments/Create";
import ViewAssessmentPage from "../pages/Dashboard/Mentor/Assessments/View";
import EditAssessmentPage from "../pages/Dashboard/Mentor/Assessments/Edit";
import AssessmentAnalyticsPage from "../pages/Dashboard/Mentor/Assessments/Analytics";

// Session Progress Components
import MentorSessionProgressPage from "../pages/Dashboard/Mentor/SessionProgress";
import LeadMentorModuleCompletionReportsPage from "../pages/Dashboard/LeadMentor/ModuleCompletionReports";
import StudentAssessmentsPage from "../pages/Dashboard/Student/Assessments";
import TakeAssessmentPage from "../pages/Dashboard/Student/Assessments/TakeAssessment";
import StudentAssessmentResultsPage from "../pages/Dashboard/Student/Assessments/Results";
import DetailedAssessmentResultsPage from "../pages/Dashboard/Student/Assessments/DetailedResults";
import StudentDashboard from "../pages/Dashboard/Student/Dashboard";
import StudentNotificationsPage from "../pages/Dashboard/Student/Notifications";

// Certificate Routes
import {
  certificateRoutes,
  studentCertificateRoutes,
} from "./certificateRoutes";

// Dashboard Components
import SuperAdminDashboard from "../pages/Dashboard/SuperAdmin/Dashboard";
import SuperAdminTest3DView from "../pages/Dashboard/SuperAdmin/Test3DView";
import LeadMentorDashboard from "../pages/Dashboard/LeadMentor/Dashboard";
import Student from "../pages/Dashboard/Student";

// Profile Components
import SuperAdminProfile from "../pages/Dashboard/SuperAdmin/Profile";
import LeadMentorProfile from "../pages/Dashboard/LeadMentor/Profile";
import SchoolAdminProfile from "../pages/Dashboard/SchoolAdmin/Profile";
import MentorProfile from "../pages/Dashboard/Mentor/Profile";
import StudentProfile from "../pages/Dashboard/Student/Profile";
import GuestProfile from "../pages/Dashboard/Guest/Profile";

// Messaging Component
import Messages from "../pages/Messages/Messages";

// Guest Components
import GuestLayout from "../components/Guest/GuestLayout";
import GuestHome from "../pages/Guest/GuestHome";
import GuestResources from "../pages/Guest/GuestResources";
import GuestResourceView from "../pages/Guest/GuestResourceView";
import GuestQuizzes from "../pages/Guest/GuestQuizzes";
import GuestClasses from "../pages/Guest/GuestClasses";
import GuestPremium from "../pages/Guest/GuestPremium";


import AddUser from "@/pages/HRMS/Admin/AddUser";
import Employee from "@/pages/HRMS/Admin/Employee";
import Holiday from "@/pages/HRMS/Admin/Holidays/Holiday";
import Document from "@/pages/HRMS/Admin/Document";
import OnboardingChecklist from "@/pages/HRMS/Admin/OnboardingChecklist";
import Letters from "@/pages/HRMS/Admin/Latters";
import Resignation from "@/pages/HRMS/Admin/Resignation";
import Clearance from "@/pages/HRMS/Admin/Clerance";
import OnboardingTasks from "@/pages/HRMS/Admin/OnboardingTask";
import FinalSettlement from "@/pages/HRMS/Admin/FinalSattlement";
import AttendanceReport from "@/pages/HRMS/Admin/AttendanceReport";
import ShiftRoster from "@/pages/HRMS/Admin/ShiftRoaster";
import LeaveType from "@/pages/HRMS/Admin/LeaveManagement/LeaveType";
import LeaveEncashment from "@/pages/HRMS/Admin/LeaveManagement/LeaveEncashment";
import SalaryStructure from "@/pages/HRMS/Admin/Payroll/SalaryStructure";
import PayrollRun from "@/pages/HRMS/Admin/Payroll/PayrollRun";
import Payslips from "@/pages/HRMS/Admin/Payroll/Payslips";
import JobOpening from "@/pages/HRMS/Admin/Recruitment/JobOpenings";
import Candidates from "@/pages/HRMS/Admin/Recruitment/Candidates";
import InterviewPipeline from "@/pages/HRMS/Admin/Recruitment/InterviewPipeline";
import RoleBasedLayout from "@/pages/HRMS/Admin/Layout/RoleBasedLayout";
import Company from "@/pages/HRMS/Admin/SystemConfigration/Company";
import Branches from "@/pages/HRMS/Admin/SystemConfigration/Branches";
import DepartmentPage from "@/pages/HRMS/Admin/SystemConfigration/Departments";
import Designation from "@/pages/HRMS/Admin/SystemConfigration/Desigantion";
import Policies from "@/pages/HRMS/Admin/SystemConfigration/Policies";
import TeamMembers from "@/pages/HRMS/Manager/Teams/TeamMembers";
import Goals from "@/pages/HRMS/Manager/Performance/Goals";
import ProbationConfirmation from "@/pages/HRMS/Admin/ProbationConfirmation";
import PersonalInformation from "@/pages/HRMS/Employee/Profile/PersonalInformation";
import DocumentUpload from "@/pages/HRMS/Employee/Profile/DocumentUpload";
import EmployeePolicies from "@/pages/HRMS/Employee/Profile/EmployeePolicies";
import MarkAttendance from "@/pages/HRMS/Employee/Attendance/MarkAttendance";
import AttendanceCalendar from "@/pages/HRMS/Employee/Attendance/AttendanceCalender";
import AttendanceRequest from "@/pages/HRMS/Employee/Attendance/AttendanceRequest";
import Leave from "@/pages/HRMS/Employee/Leave/Leaves";
import LeaveBalance from "@/pages/HRMS/Employee/Leave/LeaveBalance";
import EmployeePayslips from "@/pages/HRMS/Payroll/EmployeePayslips";
import EmployeeSalaryStructure from "@/pages/HRMS/Payroll/EmployeeSallaryStracture";
import TravelRequests from "@/pages/HRMS/Employee/Request/TravelRequests";
import Expense from "@/pages/HRMS/Employee/Expenses/Expenses";
import EmployeeGoals from "@/pages/HRMS/Employee/Performance/EmployeeGoals";
import Appraisals from "@/pages/HRMS/Manager/Performance/Appraisals";
import MyAppraisals from "@/pages/HRMS/Employee/Performance/MyAppraisals";
import FeedbackAndRatings from "@/pages/HRMS/Manager/Performance/FeedbackandRating";
import MyFeedback from "@/pages/HRMS/Employee/Performance/PerformanceHistory";
import EmployeeLetters from "@/pages/HRMS/Employee/Latters/EmployeeLatters";
import TeamAttendance from "@/pages/HRMS/Manager/Teams/TeamAttendance";
import HolidayCalendar from "@/pages/HRMS/Manager/Teams/HolidayCalender";
import LeaveCalendar from "@/pages/HRMS/Manager/Teams/LeaveCalender";
import LeaveRequest from "@/pages/HRMS/Manager/Approvals/LeaveRequest";
import EmployeeAttendanceRequest from "@/pages/HRMS/Manager/Approvals/EmployeeAttendanceRequest";
import ExpenseRequest from "@/pages/HRMS/Manager/Approvals/ExpenseRequest";
import EmployeeTravelRequest from "@/pages/HRMS/Manager/Approvals/EmployeeTravelRequest";
import AllAttendanceRequests from "@/pages/HRMS/Admin/AllAttendanceRequests";
import AdminDashboard from "@/pages/HRMS/Admin/AdminDashboard";
import EmployeeLeaveRequest from "@/pages/HRMS/Admin/EmployeeLeaveRequests";
import ManagerDashboard from "@/pages/HRMS/Manager/ManagerDashboard";
import EmployeeDashboard from "@/pages/HRMS/Employee/Dashboard/EmployeeDashboard";
import FinancePayroll from "@/pages/HRMS/Finance/Payroll/FinancePayroll";
import ShiftSchedule from "@/pages/HRMS/Employee/Attendance/Shift";
import SalaryDisbursement from "@/pages/HRMS/Finance/Payroll/SalaryDistributment";
import FinanceExpenseRequest from "@/pages/HRMS/Finance/Exprense&Remibusment/FinanceExpense";
import FinanceTravelRequest from "@/pages/HRMS/Finance/Travel/FinanceTravelRequests";
import FinanceReimbursementRequests from "@/pages/HRMS/Finance/Exprense&Remibusment/FinanceReimbursements";
import EmployeeOnboardingTask from "@/pages/HRMS/IT Admin/EmployeeOnboardingTask";
import AccountManagement from "@/pages/HRMS/IT Admin/AccountManagement";
import SoftwareAndLicenseAssignment from "@/pages/HRMS/IT Admin/SoftwearManagement";
import AssetInventory from "@/pages/HRMS/IT Admin/AsestInventory";
import AssignReassignAsset from "@/pages/HRMS/IT Admin/AssignAsset";
import ResignationRequest from "@/pages/HRMS/Employee/Request/ResignRequest";
import SAViewLeadPage from "@/pages/CRM/SuperAdmin/Leads/view";
function ProtectedRoute({
  children,
  role,
  roles,
}: {
  children: JSX.Element;
  role?: string; // ✅ old usage support
  roles?: string[]; // ✅ new usage support
}) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role?.toLowerCase().trim();

  // 🔥 smart handling: role OR roles
  const allowedRoles = roles ?? (role ? [role] : []);

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    const roleRouteMap: Record<string, string> = {
      superadmin: "/superadmin",
      manager: "/superadmin", // manager = superadmin
      leadmentor: "/leadmentor",
      schooladmin: "/schooladmin",
      admin: "/admin",
      mentor: "/mentor",
      student: "/student",
      guest: "/guest",
      "sales-manager": "/crm/sales-manager",
      "sales-executive": "/crm/sales-executive",
    };

    return <Navigate to={roleRouteMap[userRole] || "/login"} replace />;
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
  const roleRouteMap: { [key: string]: string } = {
    superadmin: "/superadmin",
    leadmentor: "/leadmentor",
    schooladmin: "/schooladmin",
    admin: "/admin",
    mentor: "/mentor",
    student: "/student",
    guest: "/guest",
    "sales-manager": "/crm/sales-manager",
    "sales-executive": "/crm/sales-executive",
  };

  const route = roleRouteMap[user.role] || "/login";
  return <Navigate to={route} replace />;
}

function CRMRootRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const roleRouteMap: { [key: string]: string } = {
    superadmin: "/crm/superadmin",
    "sales-manager": "/crm/sales-manager",
    "sales-executive": "/crm/sales-executive",
  };

  const route = roleRouteMap[user.role] || "/login";
  return <Navigate to={route} replace />;
}

function HRMSRootRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") {
    return <Navigate to="/hrms/admin/jobs" replace />;
  }

  if (user.role === "manager") {
    return <Navigate to="/hrms/manager/interviews" replace />;
  }

  return <Navigate to="/" replace />;
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
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/guest/login" element={<GuestLogin />} />
        <Route path="/guest/register" element={<GuestRegister />} />

        {/* CRM - Role-based routing */}
        <Route path="/crm" element={<CRMRootRoute />} />
        <Route
          path="/crm/superadmin/*"
          element={
            <ProtectedRoute role="superadmin">
              <SidebarProvider defaultCollapsed={false}>
                <CRMSuperAdminLayout>
                  <Routes>
                    <Route index element={<Navigate to="leads" replace />} />
                    <Route path="leads" element={<SASalesLeadsPage />} />
                    <Route path="leads/add" element={<SAAddLeadPage />} />
                    <Route path="leads/:id/edit" element={<SAEditLeadPage />} />
                    <Route path="leads/:id/view" element={<SAViewLeadPage />} />
                    <Route path="summary" element={<CRMSummaryPage />} />
                    <Route
                      path="sales-managers"
                      element={<SalesManagersPage />}
                    />
                    <Route
                      path="sales-managers/add"
                      element={<AddSalesManagerPage />}
                    />
                    <Route
                      path="sales-managers/:id/edit"
                      element={<EditSalesManagerPage />}
                    />
                    <Route
                      path="sales-executives"
                      element={<SalesExecutivesPage />}
                    />
                    <Route
                      path="sales-executives/add"
                      element={<AddSalesExecutivePage />}
                    />
                    <Route
                      path="sales-executives/:id/edit"
                      element={<EditSalesExecutivePage />}
                    />
                    <Route
                      path="notifications"
                      element={<CRMNotificationsPage />}
                    />
                  </Routes>
                </CRMSuperAdminLayout>
              </SidebarProvider>
            </ProtectedRoute>
          }
        />

        {/* HRMS */}
        <Route path="/hrms" element={<HRMSRootRoute />} />

        <Route
          path="/hrms/*"
          element={
            <SidebarProvider defaultCollapsed={false}>
              <RoleBasedLayout />
            </SidebarProvider>
          }
        >
          <Route path="admin" element={<Navigate to="dashboard" replace />} />
          {/* ADMIN ROUTES */}
          <Route path="admin/addUser" element={<AddUser />} />
          <Route path="admin/employees" element={<Employee />} />
          <Route path="admin/probation" element={<ProbationConfirmation />} />
          <Route path="admin/holidays" element={<Holiday />} />
          <Route path="admin/documents" element={<Document />} />
          <Route
            path="admin/onboarding/checklist"
            element={<OnboardingChecklist />}
          />
          <Route path="admin/letters" element={<Letters />} />
          <Route
            path="admin/offboarding/resignations"
            element={<Resignation />}
          />
          <Route path="admin/offboarding/clearance" element={<Clearance />} />
          <Route path="admin/onboarding/tasks" element={<OnboardingTasks />} />
          <Route
            path="admin/offboarding/full-final"
            element={<FinalSettlement />}
          />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/attendance" element={<AttendanceReport />} />
          <Route
            path="admin/attendance/requests"
            element={<AllAttendanceRequests />}
          />
          <Route path="admin/shifts" element={<ShiftRoster />} />
          <Route path="admin/leaves" element={<EmployeeLeaveRequest />} />
          <Route path="admin/leave-types" element={<LeaveType />} />
          <Route path="admin/leave-encashment" element={<LeaveEncashment />} />
          <Route path="admin/salary-structure" element={<SalaryStructure />} />
          <Route path="admin/payroll/run" element={<PayrollRun />} />
          <Route path="admin/payslips" element={<Payslips />} />
          <Route path="admin/jobs" element={<JobOpening />} />
          <Route path="admin/candidates" element={<Candidates />} />
          <Route path="admin/interviews" element={<InterviewPipeline />} />
          <Route path="admin/companies" element={<Company />} />
          <Route path="admin/branches" element={<Branches />} />
          <Route path="admin/departments" element={<DepartmentPage />} />
          <Route path="admin/designations" element={<Designation />} />
          <Route path="admin/policies" element={<Policies />} />

          {/* MANAGER ROUTES */}
          <Route path="manager" element={<Navigate to="dashboard" replace />} />

          <Route path="manager/dashboard" element={<ManagerDashboard />} />
          <Route path="manager/team" element={<TeamMembers />} />
          <Route path="manager/leave-calendar" element={<HolidayCalendar />} />
          <Route path="manager/performance/goals" element={<Goals />} />
          <Route
            path="manager/performance/appraisals"
            element={<Appraisals />}
          />
          <Route
            path="manager/performance/feedback"
            element={<FeedbackAndRatings />}
          />
          <Route path="manager/team-attendance" element={<TeamAttendance />} />
          <Route path="manager/leaves" element={<LeaveCalendar />} />
          <Route path="manager/approvals/leaves" element={<LeaveRequest />} />
          <Route
            path="manager/approvals/attendance"
            element={<EmployeeAttendanceRequest />}
          />
          <Route
            path="manager/approvals/expenses"
            element={<ExpenseRequest />}
          />
          <Route
            path="manager/approvals/travel"
            element={<EmployeeTravelRequest />}
          />
          {/* Employee ROUTES */}
          <Route path="employe" element={<Navigate to="dashboard" replace />} />

          <Route path="employee/dashboard" element={<EmployeeDashboard />} />
          <Route
            path="employee/profile/personal"
            element={<PersonalInformation />}
          />
          <Route
            path="employee/profile/documents"
            element={<DocumentUpload />}
          />
          <Route
            path="employee/profile/organization"
            element={<EmployeePolicies />}
          />
          <Route path="employee/attendance/mark" element={<MarkAttendance />} />
          <Route
            path="employee/attendance/calendar"
            element={<AttendanceCalendar />}
          />
          <Route
            path="employee/attendance/requests"
            element={<AttendanceRequest />}
          />
          <Route path="employee/leave/apply" element={<Leave />} />
          <Route path="employee/leave/balance" element={<LeaveBalance />} />
          <Route
            path="employee/payroll/payslips"
            element={<EmployeePayslips />}
          />
          <Route
            path="employee/payroll/salary-structure"
            element={<EmployeeSalaryStructure />}
          />
          <Route
            path="employee/request/my-requests"
            element={<TravelRequests />}
          />
          <Route
            path="employee/request/resign"
            element={<ResignationRequest />}
          />
          <Route path="employee/expenses/submit" element={<Expense />} />
          <Route
            path="employee/performance/goals"
            element={<EmployeeGoals />}
          />
          <Route
            path="employee/performance/self-appraisal"
            element={<MyAppraisals />}
          />
          <Route
            path="employee/attendance/shift-schedule"
            element={<ShiftSchedule />}
          />
          <Route path="employee/performance/history" element={<MyFeedback />} />
          <Route path="employee/letters" element={<EmployeeLetters />} />

          <Route path="finance/payroll/review" element={<FinancePayroll />} />
          <Route
            path="finance/payroll/disbursement"
            element={<SalaryDisbursement />}
          />
          <Route path="finance/expenses" element={<FinanceExpenseRequest />} />
          <Route
            path="finance/travel/advances"
            element={<FinanceTravelRequest />}
          />
          <Route
            path="finance/reimbursements"
            element={<FinanceReimbursementRequests />}
          />
          {/* MANAGER ROUTES */}
          <Route path="it/onboarding" element={<EmployeeOnboardingTask />} />
          <Route path="it/accounts" element={<AccountManagement />} />
          <Route
            path="it/software"
            element={<SoftwareAndLicenseAssignment />}
          />
          <Route path="it/assets" element={<AssetInventory />} />
          <Route path="it/assets/assign" element={<AssignReassignAsset />} />
        </Route>

        <Route
          path="/crm/sales-manager/*"
          element={
            <ProtectedRoute role="sales-manager">
              <SidebarProvider defaultCollapsed={false}>
                <CRMSalesManagerLayout>
                  <Routes>
                    <Route index element={<Navigate to="leads" replace />} />
                    <Route path="leads" element={<SMSalesLeadsPage />} />
                    <Route path="leads/add" element={<SMAddLeadPage />} />
                    <Route path="leads/:id/edit" element={<SMEditLeadPage />} />
                    <Route
                      path="leads/:id/view"
                      element={<SAViewLeadPage />}
                    />
                    <Route path="summary" element={<CRMSummaryPage />} />
                    <Route
                      path="sales-executives"
                      element={<SMSalesExecutivesPage />}
                    />
                    <Route
                      path="sales-executives/add"
                      element={<SMAddSalesExecutivePage />}
                    />
                    <Route
                      path="sales-executives/:id/edit"
                      element={<SMEditSalesExecutivePage />}
                    />
                    <Route
                      path="notifications"
                      element={<CRMNotificationsPage />}
                    />
                  </Routes>
                </CRMSalesManagerLayout>
              </SidebarProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/sales-executive/*"
          element={
            <ProtectedRoute role="sales-executive">
              <SidebarProvider defaultCollapsed={false}>
                <CRMSalesExecutiveLayout>
                  <Routes>
                    <Route index element={<Navigate to="leads" replace />} />
                    <Route path="leads" element={<SESalesLeadsPage />} />
                    <Route path="leads/add" element={<SEAddLeadPage />} />
                    <Route path="leads/:id/edit" element={<SEEditLeadPage />} />
                    <Route path="summary" element={<CRMSummaryPage />} />
                    <Route
                      path="notifications"
                      element={<CRMNotificationsPage />}
                    />
                  </Routes>
                </CRMSalesExecutiveLayout>
              </SidebarProvider>
            </ProtectedRoute>
          }
        />

        {/* SuperAdmin */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute roles={["superadmin", "manager"]}>
              <SuperAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="admins/create" element={<CreateAdminPage />} />

          {/* School Management Routes */}
          <Route path="schools" element={<SchoolsPage />} />
          <Route path="schools/create" element={<CreateSchoolPage />} />
          <Route path="schools/:id/edit" element={<EditSchoolPage />} />

          <Route path="school-admins" element={<SchoolAdminsPage />} />
          <Route
            path="school-admins/create"
            element={<CreateSchoolAdminPage />}
          />
          <Route
            path="school-admins/:id/edit"
            element={<EditSchoolAdminPage />}
          />

          <Route path="lead-mentors" element={<LeadMentorsPage />} />
          <Route
            path="lead-mentors/create"
            element={<CreateLeadMentorPage />}
          />
          <Route
            path="lead-mentors/:id/edit"
            element={<EditLeadMentorPage />}
          />

          {/* Mentor Management */}
          <Route path="mentors" element={<SuperAdminMentorsPage />} />
          <Route
            path="mentors/create"
            element={<CreateSuperAdminMentorPage />}
          />
          <Route
            path="mentors/:id/edit"
            element={<EditSuperAdminMentorPage />}
          />

          {/* Student Management */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />
          <Route
            path="students/bulk-upload"
            element={<BulkUploadStudentsPage />}
          />
          <Route path="students/promote" element={<PromoteGradePage />} />

          {/* Question Bank */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="question-bank/add" element={<AddQuestionPage />} />
          <Route
            path="question-bank/recommendations"
            element={<ViewRecommendationsPage />}
          />
          <Route
            path="question-bank/bulk-upload"
            element={<BulkUploadPage />}
          />

          {/* Session Progress */}
          <Route
            path="session-progress"
            element={<SuperAdminSessionProgressPage />}
          />

          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route
            path="assessments/:id/analytics"
            element={<AssessmentAnalyticsPage />}
          />
          <Route
            path="assessment-reports"
            element={<SuperAdminAssessmentReportsPage />}
          />

          {/* Certificate Management */}
          {certificateRoutes}

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

          {/* Modules & Sessions Management */}
          <Route path="modules" element={<ModulesPage />} />
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
          <Route path="sessions" element={<SessionsPage />} />
          <Route
            path="sessions/create"
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <CreateSessionPage />
              </PermissionProtectedRoute>
            }
          />
          <Route
            path="sessions/:id/edit"
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <EditSessionPage />
              </PermissionProtectedRoute>
            }
          />

          {/* Messaging */}
          <Route path="messages" element={<Messages />} />

          {/* Notifications */}
          <Route path="notifications" element={<SuperAdminNotifications />} />

          {/* Activity Logs */}
          <Route path="activity-logs" element={<ActivityLogsPage />} />

          {/* Access Reports */}
          <Route path="access-reports" element={<AccessReportsPage />} />

          {/* Experimental/Test Routes */}
          <Route path="test" element={<SuperAdminTest3DView />} />
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

        {/* School Admin */}
        <Route
          path="/schooladmin"
          element={
            <ProtectedRoute role="schooladmin">
              <SchoolAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<SchoolAdminDashboard />} />
          <Route path="profile" element={<SchoolAdminProfile />} />
          <Route path="mentors" element={<SchoolAdminMentorsPage />} />
          <Route path="students" element={<SchoolAdminStudentsPage />} />
          <Route
            path="session-progress"
            element={<SchoolAdminSessionProgressPage />}
          />
          <Route path="schools" element={<SchoolAdminSchoolsPage />} />
          <Route path="settings" element={<SchoolAdminSettingsPage />} />
          <Route
            path="assessment-reports"
            element={<SchoolAdminAssessmentReportsPage />}
          />
          <Route
            path="assessments/:id/analytics"
            element={<AssessmentAnalyticsPage />}
          />

          {/* Messaging */}
          <Route path="messages" element={<Messages />} />
        </Route>

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
          <Route path="profile" element={<LeadMentorProfile />} />
          <Route path="school-admins" element={<SchoolAdminsPage />} />
          <Route
            path="school-admins/create"
            element={<CreateSchoolAdminPage />}
          />
          <Route
            path="school-admins/:id/edit"
            element={<LeadMentorEditSchoolAdminPage />}
          />
          <Route path="schools" element={<LeadMentorSchoolsPage />} />
          {/* Lead mentors management is not available to leadmentor role */}

          {/* Mentor Management */}
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          <Route path="mentors/:id/edit" element={<EditMentorPage />} />

          {/* Student Management */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/create" element={<CreateStudentPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />
          <Route
            path="students/bulk-upload"
            element={<BulkUploadStudentsPage />}
          />
          <Route path="students/promote" element={<PromoteGradePage />} />

          {/* Question Bank */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="question-bank/add" element={<AddQuestionPage />} />
          <Route
            path="question-bank/recommendations"
            element={<ViewRecommendationsPage />}
          />
          <Route
            path="question-bank/bulk-upload"
            element={<BulkUploadPage />}
          />

          {/* Session Progress */}
          <Route
            path="session-progress"
            element={<LeadMentorSessionProgressPage />}
          />

          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route
            path="assessments/:id/analytics"
            element={<AssessmentAnalyticsPage />}
          />
          <Route
            path="assessment-reports"
            element={<LeadMentorAssessmentReportsPage />}
          />

          {/* Certificate Management */}
          {certificateRoutes}

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

          {/* Modules & Sessions Management */}
          <Route path="modules" element={<ModulesPage />} />
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
          <Route path="sessions" element={<SessionsPage />} />
          <Route
            path="sessions/create"
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <CreateSessionPage />
              </PermissionProtectedRoute>
            }
          />
          <Route
            path="sessions/:id/edit"
            element={
              <PermissionProtectedRoute requiredPermission="add_modules">
                <EditSessionPage />
              </PermissionProtectedRoute>
            }
          />

          {/* Module Completion Reports */}
          <Route
            path="module-completion-reports"
            element={<LeadMentorModuleCompletionReportsPage />}
          />

          {/* Messaging */}
          <Route path="messages" element={<Messages />} />

          {/* Notifications */}
          <Route path="notifications" element={<LeadMentorNotifications />} />

          {/* Access Reports */}
          <Route path="access-reports" element={<AccessReportsPage />} />
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
          <Route path="profile" element={<MentorProfile />} />
          <Route path="students" element={<MentorStudentsPage />} />
          <Route path="resources" element={<MentorResourcesPage />} />
          <Route
            path="resources/:id/view"
            element={<MentorResourceViewPage />}
          />

          {/* Question Bank */}
          <Route path="question-bank" element={<MentorQuestionBankPage />} />
          <Route
            path="question-bank/recommend"
            element={<AddRecommendationPage />}
          />
          <Route
            path="question-bank/my-recommendations"
            element={<MyRecommendationsPage />}
          />

          {/* Assessment Management */}
          <Route path="assessments" element={<MentorAssessmentsPage />} />
          <Route path="assessments/create" element={<CreateAssessmentPage />} />
          <Route path="assessments/:id" element={<ViewAssessmentPage />} />
          <Route path="assessments/:id/edit" element={<EditAssessmentPage />} />
          <Route
            path="assessments/:id/analytics"
            element={<AssessmentAnalyticsPage />}
          />

          {/* Session Progress Management */}
          <Route
            path="session-progress"
            element={<MentorSessionProgressPage />}
          />

          {/* Messaging */}
          <Route path="messages" element={<Messages />} />

          {/* Notifications */}
          <Route path="notifications" element={<MentorNotifications />} />
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
          <Route path="profile" element={<StudentProfile />} />
          <Route path="resources" element={<StudentResourcesPage />} />
          <Route
            path="resources/:id/view"
            element={<StudentResourceViewPage />}
          />

          {/* Assessment Routes */}
          <Route path="assessments" element={<StudentAssessmentsPage />} />
          <Route path="assessments/:id/take" element={<TakeAssessmentPage />} />
          <Route
            path="assessments/results"
            element={<StudentAssessmentResultsPage />}
          />
          <Route
            path="assessments/results/:id"
            element={<DetailedAssessmentResultsPage />}
          />

          {/* Notification Routes */}
          <Route path="notifications" element={<StudentNotificationsPage />} />

          {/* Certificate Routes */}
          {studentCertificateRoutes}

          {/* Messaging */}
          <Route path="messages" element={<Messages />} />
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
          <Route path="profile" element={<GuestProfile />} />
          <Route path="resources" element={<GuestResources />} />
          <Route path="resource/:id/view" element={<GuestResourceView />} />
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
