import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Mail, Phone, MapPin } from "lucide-react";
import { schoolAdminService, type Mentor } from "@/api/schoolAdminService";
import { toast } from "sonner";

export default function SchoolAdminMentorsPage() {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getMentors();
      
      if (response.success) {
        setMentors(response.data.mentors);
        setSchoolAdmin(response.data.schoolAdmin);
      } else {
        toast.error("Failed to load mentors");
      }
    } catch (error) {
      console.error("Error loading mentors:", error);
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">School Mentors</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage mentors assigned to your schools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {mentors.length} Mentor(s)
          </span>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mentors.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <UserCheck className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No Mentors Found</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    No mentors are currently assigned to your schools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          mentors.map((mentor) => (
            <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg">{mentor.user.name}</CardTitle>
                  <Badge variant={mentor.isActive ? "default" : "secondary"} className="text-xs">
                    {mentor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                    <Mail className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="truncate">{mentor.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 md:h-4 md:w-4" />
                    <span>{mentor.phoneNumber}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-xs md:text-sm">Assigned School:</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs md:text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="bg-muted px-2 py-1 rounded text-xs truncate">
                        {mentor.assignedSchool.name} - {mentor.assignedSchool.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Added: {new Date(mentor.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
