import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Mail, Phone, Crown, Globe, KeyRound } from "lucide-react";
import { leadMentorService, type LeadMentor } from "@/api/leadMentorService";
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

export default function LeadMentorsPage() {
  const location = useLocation();
  const [leadMentors, setLeadMentors] = useState<LeadMentor[]>([]);
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
    fetchLeadMentors();
  }, []);

  const fetchLeadMentors = async () => {
    try {
      const response = await leadMentorService.getAll();
      if (response.success) {
        setLeadMentors(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch lead mentors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteLoading(id);
    try {
      const response = await leadMentorService.delete(id);
      if (response.success) {
        toast.success(`${name} deleted successfully`);
        fetchLeadMentors(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete lead mentor");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading lead mentors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Mentors</h1>
          <p className="text-gray-600">Manage lead mentors and their school assignments</p>
        </div>
        <Link to={`${basePath}/lead-mentors/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead Mentor
          </Button>
        </Link>
      </div>

      {leadMentors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Crown className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lead mentors found</h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by adding your first lead mentor.
            </p>
            <Link to={`${basePath}/lead-mentors/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lead Mentor
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
                <TableHead>School Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadMentors.map((mentor) => (
                <TableRow key={mentor._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      {mentor.user.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      {mentor.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      {mentor.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mentor.hasAccessToAllSchools ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Globe className="h-3 w-3 mr-1" />
                        All Schools
                      </Badge>
                    ) : mentor.assignedSchools.length === 0 ? (
                      <span className="text-gray-400">No schools assigned</span>
                    ) : (
                      <div>
                        <span className="text-sm">{mentor.assignedSchools.length} schools</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {mentor.assignedSchools.slice(0, 2).map((school) => (
                            <div key={school._id}>• {school.name}</div>
                          ))}
                          {mentor.assignedSchools.length > 2 && (
                            <div>+{mentor.assignedSchools.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={mentor.user.isVerified ? "default" : "secondary"}>
                        {mentor.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                      <Badge variant={mentor.isActive ? "default" : "destructive"}>
                        {mentor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(mentor.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setResetPasswordUser({
                            id: mentor.user._id,
                            name: mentor.user.name,
                            email: mentor.user.email,
                          })
                        }
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Link to={`${basePath}/lead-mentors/${mentor._id}/edit`}>
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
                            <AlertDialogTitle>Delete Lead Mentor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{mentor.user.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(mentor._id, mentor.user.name)}
                              disabled={deleteLoading === mentor._id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteLoading === mentor._id ? "Deleting..." : "Delete"}
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
