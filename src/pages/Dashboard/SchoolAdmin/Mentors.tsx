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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Mentors</h1>
          <p className="text-muted-foreground">
            Manage mentors assigned to your schools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {mentors.length} Mentor(s)
          </span>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
                  <p className="text-muted-foreground">
                    No mentors are currently assigned to your schools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          mentors.map((mentor) => (
            <Card key={mentor._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{mentor.user.name}</CardTitle>
                  <Badge variant={mentor.isActive ? "default" : "secondary"}>
                    {mentor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{mentor.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{mentor.phoneNumber}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Assigned Schools:</h4>
                  <div className="space-y-1">
                    {mentor.assignedSchools.map((school) => (
                      <div key={school._id} className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="bg-muted px-2 py-1 rounded text-xs">
                          {school.name} - {school.city}
                        </span>
                      </div>
                    ))}
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
