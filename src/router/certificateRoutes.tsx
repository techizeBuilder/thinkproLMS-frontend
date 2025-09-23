import type { JSX } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute as PermissionProtectedRoute } from "../components/ProtectedRoute";

// Certificate Components
import CertificatesPage from "../pages/Dashboard/Mentor/Certificates";
import CreateCertificatePage from "../pages/Dashboard/Mentor/Certificates/CreateCertificate";
import CertificatePreviewPage from "../pages/Dashboard/Mentor/Certificates/CertificatePreview";
import ViewCertificatePage from "../pages/Dashboard/Mentor/Certificates/ViewCertificate";
import StudentCertificatesPage from "../pages/Dashboard/Student/Certificates";
import StudentCertificateViewPage from "../pages/Dashboard/Student/Certificates/ViewCertificate";

export const certificateRoutes = (
  <>
    {/* Certificate Management Routes */}
    <Route 
      path="certificates" 
      element={
        <PermissionProtectedRoute requiredPermission="certificate_view">
          <CertificatesPage />
        </PermissionProtectedRoute>
      } 
    />
    <Route 
      path="certificates/create" 
      element={
        <PermissionProtectedRoute requiredPermission="certificate_manage">
          <CreateCertificatePage />
        </PermissionProtectedRoute>
      } 
    />
    <Route 
      path="certificates/:id" 
      element={
        <PermissionProtectedRoute requiredPermission="certificate_view">
          <ViewCertificatePage />
        </PermissionProtectedRoute>
      } 
    />
    <Route 
      path="certificates/preview" 
      element={
        <PermissionProtectedRoute requiredPermission="certificate_manage">
          <CertificatePreviewPage />
        </PermissionProtectedRoute>
      } 
    />
    <Route 
      path="certificates/:id/preview" 
      element={
        <PermissionProtectedRoute requiredPermission="certificate_manage">
          <CertificatePreviewPage />
        </PermissionProtectedRoute>
      } 
    />
  </>
);

export const studentCertificateRoutes = (
  <>
    {/* Student Certificate Routes */}
    <Route path="certificates" element={<StudentCertificatesPage />} />
    <Route path="certificates/:id" element={<StudentCertificateViewPage />} />
  </>
);
