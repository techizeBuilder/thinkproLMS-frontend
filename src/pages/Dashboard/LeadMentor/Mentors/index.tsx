import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  board: string;
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
        mentor.assignedSchools.some((school) => school._id === selectedSchool)
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

      {/* Mentors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <ProfilePictureDisplay
                    profilePicture={mentor.user.profilePicture}
                    name={mentor.user.name}
                    size="md"
                  />
                  <div>
                    <CardTitle className="text-lg">
                      {mentor.salutation} {mentor.user.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={mentor.user.isVerified ? "default" : "secondary"}>
                        {mentor.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/leadmentor/mentors/${mentor._id}/edit`)}
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
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                {mentor.user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {mentor.phoneNumber}
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="flex-1">{mentor.address}</span>
              </div>
              
              {/* Assigned Schools */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Assigned Schools ({mentor.assignedSchools.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {mentor.assignedSchools.slice(0, 2).map((school) => (
                    <Badge key={school._id} variant="outline" className="text-xs">
                      {school.name}
                    </Badge>
                  ))}
                  {mentor.assignedSchools.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.assignedSchools.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No mentors found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
