import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { Plus, Shield, Users, Loader2 } from "lucide-react";
import { MobileActions } from "@/components/ui/mobile-actions";

interface SuperAdmin {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isSystemAdmin?: boolean;
  createdAt: string;
}

const SuperAdminsPage = () => {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [superAdminToDelete, setSuperAdminToDelete] = useState<SuperAdmin | null>(null);

  useEffect(() => {
    const fetchSuperAdmins = async () => {
      try {
        const response = await axiosInstance.get("/superadmins");
        setSuperAdmins(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch superadmins");
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdmins();
  }, []);

  const handleDeleteClick = (superAdmin: SuperAdmin) => {
    setSuperAdminToDelete(superAdmin);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!superAdminToDelete) return;
    
    setDeleteLoading(superAdminToDelete._id);
    try {
      await axiosInstance.delete(`/superadmins/${superAdminToDelete._id}`);
      setSuperAdmins(prev => prev.filter(admin => admin._id !== superAdminToDelete._id));
      toast.success(`${superAdminToDelete.name} has been deleted successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete superadmin");
    } finally {
      setDeleteLoading(null);
      setShowDeleteDialog(false);
      setSuperAdminToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading superadmins...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">SuperAdmins</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage system superadmins and their permissions
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/superadmin/admins/create">
            <Plus className="mr-2 h-4 w-4" />
            Add SuperAdmin
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            SuperAdmins Management
          </CardTitle>
          <CardDescription>
            A list of all superadmins in the system. System superadmin cannot be deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {superAdmins.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No superadmins found</h3>
              <p className="text-muted-foreground">
                Get started by creating your first superadmin.
              </p>
              <Button asChild className="mt-4">
                <Link to="/superadmin/admins/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add SuperAdmin
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {superAdmins.map((superAdmin) => (
                  <TableRow key={superAdmin._id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        {superAdmin.name}
                        {superAdmin.isSystemAdmin && (
                          <Badge variant="info" className="text-xs">
                            <Shield className="mr-1 h-3 w-3" />
                            System
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {superAdmin.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={superAdmin.isVerified ? "success" : "warning"}
                      >
                        {superAdmin.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(superAdmin.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <MobileActions
                        onDelete={!superAdmin.isSystemAdmin ? () => handleDeleteClick(superAdmin) : undefined}
                        isSystemAdmin={superAdmin.isSystemAdmin}
                        isSuperAdmin={true}
                        deleteLoading={deleteLoading === superAdmin._id}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SuperAdmin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{superAdminToDelete?.name}</strong> ({superAdminToDelete?.email})?
              <br />
              <br />
              This action cannot be undone and will permanently remove the superadmin from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete SuperAdmin"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdminsPage;
