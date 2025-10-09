import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, KeyRound } from "lucide-react";
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
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
    profilePicture?: string | null;
  };
  salutation: string;
  address: string;
  phoneNumber: string;
  assignedSchool: School;
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
        mentor.assignedSchool._id === selectedSchool
      );
    }

    setFilteredMentors(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;

    try {
      await axiosInstance.delete(`/mentors/${id}`);
      setMentors(mentors.filter((mentor) => mentor._id !== id));
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
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
          onClick={() => navigate("/leadmentor/mentors/create")} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Mentor
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
      <Card>
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
                        profilePicture={mentor.user.profilePicture}
                        name={mentor.user.name}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {mentor.salutation} {mentor.user.name}
                      </div>
                    </div>
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
                  <div className="flex items-start text-sm">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5 text-gray-500" />
                    <span className="line-clamp-2">{mentor.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <Badge variant="outline" className="text-xs">
                      {mentor.assignedSchool.name}
                    </Badge>
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
                        navigate(`/leadmentor/mentors/${mentor._id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mentor._id)}
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
      </Card>

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
    </div>
  );
}
