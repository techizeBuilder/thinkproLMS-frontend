import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Mail, Phone, Crown, Globe } from "lucide-react";
import { MobileActions } from "@/components/ui/mobile-actions";
import { leadMentorService, type LeadMentor } from "@/api/leadMentorService";
import { toast } from "sonner";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeadMentorsPage() {
  const location = useLocation();
  const [leadMentors, setLeadMentors] = useState<LeadMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("active");
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
  }, [statusFilter]);

  const fetchLeadMentors = async () => {
    try {
      setLoading(true);
      const includeInactive = statusFilter === "all" || statusFilter === "inactive";
      const response = await leadMentorService.getAll({ includeInactive });
      if (response.success) {
        let data = response.data;
        if (statusFilter === "active") {
          data = data.filter((lm) => lm.isActive);
        } else if (statusFilter === "inactive") {
          data = data.filter((lm) => !lm.isActive);
        }
        setLeadMentors(data);
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

  const handleToggleStatus = async (id: string, name: string, isActive: boolean) => {
    setToggleLoading(id);
    try {
      const response = await leadMentorService.update(id, { isActive: !isActive });
      if (response.success) {
        toast.success(`${name} ${isActive ? "deactivated" : "activated"} successfully`);
        fetchLeadMentors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isActive ? "deactivate" : "activate"} lead mentor`);
    } finally {
      setToggleLoading(null);
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Lead Mentors</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage lead mentors and their school assignments</p>
        </div>
        <Link to={`${basePath}/lead-mentors/create`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead Mentor
          </Button>
        </Link>
      </div>

      {/* Filter */}
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[150px]">School Access</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                    <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {leadMentors.map((mentor) => (
                <TableRow key={mentor._id} className={!mentor.isActive ? "opacity-60" : ""}>
                  <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[150px]">
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
                    <MobileActions
                      editUrl={`${basePath}/lead-mentors/${mentor._id}/edit`}
                      onResetPassword={() =>
                        setResetPasswordUser({
                          id: mentor.user._id,
                          name: mentor.user.name,
                          email: mentor.user.email,
                        })
                      }
                      onDelete={() => handleDelete(mentor._id, mentor.user.name)}
                      deleteLoading={deleteLoading === mentor._id}
                      isSuperAdmin={true}
                      onToggleStatus={() => handleToggleStatus(mentor._id, mentor.user.name, mentor.isActive)}
                      isActive={mentor.isActive}
                      toggleLoading={toggleLoading === mentor._id}
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
    </div>
  );
}
