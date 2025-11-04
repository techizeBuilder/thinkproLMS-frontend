import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";
import { useHasPermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { usePaginatedSelect } from "@/hooks/usePaginatedSelect";
import { schoolService } from "@/api/schoolService";
import { Loader2 } from "lucide-react";

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
  const [includeInactive, setIncludeInactive] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const navigate = useNavigate();
  const { hasPermission } = useHasPermission();

  // Count active and inactive mentors
  const activeCount = mentors.filter((mentor) => mentor.isActive !== false).length;
  const inactiveCount = mentors.filter((mentor) => mentor.isActive === false).length;

  useEffect(() => {
    fetchMentors();
  }, []);

  // Load schools with pagination
  const loadSchools = async (page: number, limit: number) => {
    try {
      const response = await schoolService.getAll({ page, limit });
      return response;
    } catch (error) {
      console.error("Error loading schools:", error);
      return { success: false, data: [], pagination: undefined };
    }
  };

  const {
    items: paginatedSchools,
    loading: schoolsLoading,
    hasMore: hasMoreSchools,
    loadMore: loadMoreSchools,
  } = usePaginatedSelect({
    fetchFunction: loadSchools,
    limit: 20,
  });

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, selectedSchool, includeInactive]);

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
          return typeof school === "string"
            ? school === selectedSchool
            : school._id === selectedSchool;
        })
      );
    }

    // Active/Inactive filter
    if (!includeInactive) {
      filtered = filtered.filter((mentor) => mentor.isActive !== false);
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">School Mentors</h1>
          <p className="text-sm md:text-base text-gray-600">Manage mentors assigned to schools</p>
        </div>
        {hasPermission(PERMISSIONS.ADD_MENTORS) && (
          <Button 
            onClick={() => navigate("/leadmentor/mentors/create")} 
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm md:text-base">Add School Mentor</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search mentors by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm md:text-base"
                />
              </div>
            </div>
            <Select
              value={selectedSchool || "all"}
              onValueChange={(value) => setSelectedSchool(value === "all" ? "" : value)}
            >
              <SelectTrigger className="min-w-0 sm:min-w-[200px] text-sm md:text-base">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {paginatedSchools.map((school) => (
                  <SelectItem key={school._id} value={school._id}>
                    {school.name} - {school.city}
                  </SelectItem>
                ))}
                {hasMoreSchools && (
                  <div
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!schoolsLoading && hasMoreSchools) {
                        loadMoreSchools();
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center justify-center w-full py-2">
                      {schoolsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Schools"
                      )}
                    </div>
                  </div>
                )}
              </SelectContent>
            </Select>
            <Select
              value={includeInactive ? "all" : "active"}
              onValueChange={(value) => setIncludeInactive(value === "all")}
            >
              <SelectTrigger className="min-w-0 sm:min-w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  Active Only ({activeCount})
                </SelectItem>
                <SelectItem value="all">
                  All (Including Inactive) ({activeCount + inactiveCount})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
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
                          {mentor.user.name}
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
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={mentor.isActive !== false ? "default" : "secondary"}
                      >
                        {mentor.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        variant={
                          mentor.user.isVerified ? "outline" : "secondary"
                        }
                        className="text-xs"
                      >
                        {mentor.user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
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
                      {hasPermission(PERMISSIONS.ADD_MENTORS) && (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden">
        <div className="grid gap-4">
          {filteredMentors.map((mentor) => (
            <Card key={mentor._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10">
                      <ProfilePictureDisplay
                        profilePicture={mentor.user.profilePicture}
                        name={mentor.user.name}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm md:text-base">
                        {mentor.user.name}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <Badge
                          variant={mentor.isActive !== false ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {mentor.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                        <Badge
                          variant={
                            mentor.user.isVerified ? "outline" : "secondary"
                          }
                          className="text-xs"
                        >
                          {mentor.user.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setResetPasswordUser({
                          id: mentor._id,
                          name: mentor.user.name,
                          email: mentor.user.email,
                        })
                      }
                      title="Reset Password"
                      className="h-8 w-8 p-0"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    {hasPermission(PERMISSIONS.ADD_MENTORS) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/leadmentor/mentors/${mentor._id}/edit`)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mentor._id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{mentor.user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span>{mentor.phoneNumber}</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                    <span className="line-clamp-2">{mentor.address}</span>
                  </div>
                  <div className="pt-2">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 text-sm md:text-base">No mentors found</p>
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
