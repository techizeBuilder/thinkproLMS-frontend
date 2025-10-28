import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Mail, Phone, CheckCircle } from "lucide-react";
import { MobileActions } from "@/components/ui/mobile-actions";
import { schoolAdminService, type SchoolAdmin } from "@/api/schoolAdminService";
import { toast } from "sonner";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function SchoolAdminsPage() {
  const location = useLocation();
  const [schoolAdmins, setSchoolAdmins] = useState<SchoolAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    adminName: string;
  } | null>(null);
  const { user } = useAuth();
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // Determine the base path based on current route
  const isLeadMentor = location.pathname.includes("/leadmentor");
  const basePath = isLeadMentor ? "/leadmentor" : "/superadmin";

  useEffect(() => {
    fetchSchoolAdmins();
  }, [statusFilter]);

  const fetchSchoolAdmins = async () => {
    try {
      setLoading(true);
      const includeInactive =
        statusFilter === "all" || statusFilter === "inactive";
      const response = await schoolAdminService.getAll({ includeInactive });
      if (response.success) {
        let filteredData = response.data;

        // Apply client-side filtering based on status
        if (statusFilter === "active") {
          filteredData = response.data.filter((admin) => admin.isActive);
        } else if (statusFilter === "inactive") {
          filteredData = response.data.filter((admin) => !admin.isActive);
        }
        // If statusFilter === "all", show all data

        setSchoolAdmins(filteredData);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch school admins"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete School Admin',
      message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      adminName: name,
      onConfirm: () => performDelete(id, name)
    });
  };

  const performDelete = async (id: string, name: string) => {
    setDeleteLoading(id);
    setConfirmDialog(null);
    try {
      const response = await schoolAdminService.delete(id);
      if (response.success) {
        toast.success(`${name} deleted successfully`);
        fetchSchoolAdmins(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete school admin"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleStatus = (id: string, name: string, isActive: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: isActive ? 'Deactivate School Admin' : 'Activate School Admin',
      message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${name}?`,
      adminName: name,
      onConfirm: () => performToggleStatus(id, name, isActive)
    });
  };

  const performToggleStatus = async (id: string, name: string, isActive: boolean) => {
    setToggleLoading(id);
    setConfirmDialog(null);
    try {
      const response = isActive 
        ? await schoolAdminService.deactivate(id)
        : await schoolAdminService.activate(id);
      
      if (response.success) {
        toast.success(`${name} ${isActive ? 'deactivated' : 'activated'} successfully`);
        fetchSchoolAdmins(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${isActive ? 'deactivate' : 'activate'} school admin`
      );
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading school admins...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">School Admins</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage school administrators
          </p>
        </div>
        <Link
          to={`${basePath}/school-admins/create`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add School Admin
          </Button>
        </Link>
      </div>

      {/* Statistics and Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {" "}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {schoolAdmins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No school admins found
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by adding your first school administrator.
            </p>
            <Link to={`${basePath}/school-admins/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add School Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[150px]">School</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolAdmins.map((admin) => (
                    <TableRow
                      key={admin._id}
                      className={!admin.isActive ? "opacity-60" : ""}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          {admin.user?.name || 'Unknown User'}
                          {!admin.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          {admin.user?.email || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                          {admin.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {admin.assignedSchool ? (
                          <span className="text-sm">
                            {admin.assignedSchool.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">
                            No school assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              admin.user?.isVerified ? "default" : "secondary"
                            }
                          >
                            {admin.user?.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          <Badge
                            variant={admin.isActive ? "default" : "destructive"}
                          >
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <MobileActions
                          editUrl={`${basePath}/school-admins/${admin._id}/edit`}
                          onResetPassword={admin.user ? () => {
                            setResetPasswordUser({
                              id: admin.user!._id,
                              name: admin.user!.name,
                              email: admin.user!.email,
                            });
                          } : undefined}
                          onDelete={() => handleDelete(admin._id, admin.user?.name || 'Unknown User')}
                          onToggleStatus={() =>
                            handleToggleStatus(admin._id, admin.user?.name || 'Unknown User', admin.isActive)
                          }
                          isActive={admin.isActive}
                          isSuperAdmin={user?.role === "superadmin"}
                          deleteLoading={deleteLoading === admin._id}
                          toggleLoading={toggleLoading === admin._id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          userId={resetPasswordUser.id}
          userName={resetPasswordUser.name}
          userEmail={resetPasswordUser.email}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.isOpen || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog?.onConfirm}
              className={
                confirmDialog?.title?.includes('Delete')
                  ? 'bg-red-600 hover:bg-red-700'
                  : confirmDialog?.title?.includes('Deactivate')
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {confirmDialog?.title?.includes('Delete')
                ? 'Delete'
                : confirmDialog?.title?.includes('Deactivate')
                ? 'Deactivate'
                : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
