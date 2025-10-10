import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { School, MapPin, Building } from "lucide-react";
import { schoolAdminService } from "@/api/schoolAdminService";
import { toast } from "sonner";

interface SchoolData {
  _id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  board?: string;
  affiliatedTo?: string;
  branchName?: string;
}

export default function SchoolAdminSchoolsPage() {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getMentors(); // Using mentors endpoint to get school admin data
      
      if (response.success) {
        setSchools(response.data.schoolAdmin.assignedSchool ? [response.data.schoolAdmin.assignedSchool] : []);
        setSchoolAdmin(response.data.schoolAdmin);
      } else {
        toast.error("Failed to load schools");
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
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
          <h1 className="text-2xl md:text-3xl font-bold">Assigned Schools</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Schools under your management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <School className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {schools.length} School(s)
          </span>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {schools.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex items-center justify-center py-8 md:py-12">
                <div className="text-center">
                  <School className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No Schools Assigned</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    You are not currently assigned to manage any schools.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          schools.map((school) => (
            <Card key={school._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <Building className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base md:text-lg">{school.name}</CardTitle>
                      {school.branchName && (
                        <p className="text-xs md:text-sm text-muted-foreground">{school.branchName}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <span>{school.city}, {school.state}</span>
                  </div>
                  {school.address && (
                    <div className="text-xs md:text-sm text-muted-foreground ml-5 md:ml-6">
                      {school.address}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  {school.board && (
                    <div>
                      <span className="text-muted-foreground">Board:</span>
                      <div className="font-medium">{school.board}</div>
                    </div>
                  )}
                  {school.affiliatedTo && (
                    <div>
                      <span className="text-muted-foreground">Affiliated To:</span>
                      <div className="font-medium">{school.affiliatedTo}</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>School ID: {school._id.slice(-8)}</span>
                    <span>Under Management</span>
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
