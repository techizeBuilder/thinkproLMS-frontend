import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Mail, Phone, CheckCircle, KeyRound } from "lucide-react";
import { schoolAdminService, type SchoolAdmin } from "@/api/schoolAdminService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";

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
  
  // Determine the base path based on current route
  const isLeadMentor = location.pathname.includes('/leadmentor');
  const basePath = isLeadMentor ? '/leadmentor' : '/superadmin';

  useEffect(() => {
    fetchSchoolAdmins();
  }, []);

  const fetchSchoolAdmins = async () => {
    try {
      const response = await schoolAdminService.getAll();
      if (response.success) {
        setSchoolAdmins(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch school admins");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteLoading(id);
    try {
      const response = await schoolAdminService.delete(id);
      if (response.success) {
        toast.success(`${name} deleted successfully`);
        fetchSchoolAdmins(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete school admin");
    } finally {
      setDeleteLoading(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">School Admins</h1>
          <p className="text-gray-600">Manage school administrators</p>
        </div>
        <Link to={`${basePath}/school-admins/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add School Admin
          </Button>
        </Link>
      </div>

      {schoolAdmins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No school admins found</h3>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Schools</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolAdmins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      {admin.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      {admin.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.assignedSchools.length === 0 ? (
                      <span className="text-gray-400">No schools assigned</span>
                    ) : admin.assignedSchools.length === 1 ? (
                      <span className="text-sm">{admin.assignedSchools[0].name}</span>
                    ) : (
                      <span className="text-sm">
                        {admin.assignedSchools.length} schools
                        <div className="text-xs text-gray-500 mt-1">
                          {admin.assignedSchools.slice(0, 2).map((school) => (
                            <div key={school._id}>• {school.name}</div>
                          ))}
                          {admin.assignedSchools.length > 2 && (
                            <div>+{admin.assignedSchools.length - 2} more</div>
                          )}
                        </div>
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={admin.user.isVerified ? "default" : "secondary"}>
                        {admin.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                      <Badge variant={admin.isActive ? "default" : "destructive"}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setResetPasswordUser({
                            id: admin.user._id,
                            name: admin.user.name,
                            email: admin.user.email,
                          })
                        }
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Link to={`${basePath}/school-admins/${admin._id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete School Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{admin.user.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(admin._id, admin.user.name)}
                              disabled={deleteLoading === admin._id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteLoading === admin._id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </div>
  );
}
