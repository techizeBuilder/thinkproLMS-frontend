import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  boards: string[];
  branchName?: string;
}

interface Mentor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
    profilePicture?: string | null;
  };
  address: string;
  phoneNumber: string;
  assignedSchools: School[];
  isActive: boolean;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
    fetchSchools();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, selectedSchool]);

  const fetchMentors = async () => {
    try {
      const response = await axiosInstance.get("/mentors");
      setMentors(response.data.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/schools");
      setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    if (searchTerm) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.phoneNumber.includes(searchTerm)
      );
    }

    if (selectedSchool) {
      filtered = filtered.filter((mentor) =>
        Array.isArray(mentor.assignedSchools) &&
        mentor.assignedSchools.some((school: any) => {
          if (!school) return false;
          // Handle both populated objects and ObjectId strings
          return typeof school === "string"
            ? school === selectedSchool
            : school._id === selectedSchool;
        })
      );
    }

    setFilteredMentors(filtered);
  };

  const handleDelete = (mentor: Mentor) => {
    const assigned = Array.isArray(mentor.assignedSchools)
      ? mentor.assignedSchools.filter((s: any) => !!s && typeof s !== "string").length
      : 0;
    setConfirmDialog({
      isOpen: true,
      title: "Delete School Mentor",
      message:
        assigned > 0
          ? `${mentor.user?.name ?? "This mentor"} is assigned to ${assigned} school(s). Deleting will remove the mentor account. Consider unassigning schools first. This action cannot be undone.`
          : `Are you sure you want to delete ${mentor.user?.name ?? "this mentor"}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await axiosInstance.delete(`/mentors/${mentor._id}`);
          setMentors((prev) => prev.filter((m) => m._id !== mentor._id));
        } catch (error) {
          console.error("Error deleting mentor:", error);
        }
      },
    });
  };

  if (loading) {
    return <div className="p-6">Loading mentors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Mentors</h1>
          <p className="text-gray-600">Manage mentors assigned to schools</p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/mentors/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add School Mentor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search mentors by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} - {school.city}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Table */}
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMentors.map((mentor) => (
              <TableRow key={mentor._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <ProfilePictureDisplay
                        profilePicture={mentor.user?.profilePicture}
                        name={mentor.user?.name ?? "User"}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {mentor.user?.name ?? "—"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    {mentor.user?.email ?? "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    {mentor.phoneNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start text-sm">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5 text-gray-500" />
                    <span className="line-clamp-2">{mentor.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      {(mentor.assignedSchools ?? [])
                        .filter((school: any) => !!school && typeof school !== "string")
                        .map((school: any) => (
                          <Badge key={school._id} variant="outline" className="text-xs">
                            {school.name}
                          </Badge>
                        ))}
                      {(!mentor.assignedSchools || mentor.assignedSchools.length === 0) && (
                        <span className="text-xs text-gray-500">No schools</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mentor.user.isVerified ? "default" : "secondary"
                    }
                  >
                    {mentor.user.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/superadmin/mentors/${mentor._id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mentor)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No mentors found</p>
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
            <AlertDialogDescription>{confirmDialog?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog?.onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
