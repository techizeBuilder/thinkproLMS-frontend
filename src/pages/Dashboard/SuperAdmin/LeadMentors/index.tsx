import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Mail, Phone, Crown, Globe } from "lucide-react";
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

export default function LeadMentorsPage() {
  const location = useLocation();
  const [leadMentors, setLeadMentors] = useState<LeadMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {leadMentors.map((mentor) => (
            <Card key={mentor._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      {mentor.user.name}
                    </CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge variant={mentor.user.isVerified ? "default" : "secondary"}>
                        {mentor.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                      <Badge variant={mentor.isActive ? "default" : "destructive"}>
                        {mentor.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {mentor.hasAccessToAllSchools && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          <Globe className="h-3 w-3 mr-1" />
                          All Schools
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{mentor.user.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{mentor.phoneNumber}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">School Access:</p>
                    {mentor.hasAccessToAllSchools ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Globe className="h-3 w-3 mr-1" />
                        Access to All Schools
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        {mentor.assignedSchools.length === 0 ? (
                          <p className="text-sm text-gray-500">No schools assigned</p>
                        ) : (
                          <div className="space-y-1">
                            {mentor.assignedSchools.slice(0, 2).map((school) => (
                              <p key={school._id} className="text-sm text-gray-600">
                                • {school.name} ({school.city})
                              </p>
                            ))}
                            {mentor.assignedSchools.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{mentor.assignedSchools.length - 2} more schools
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {new Date(mentor.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
