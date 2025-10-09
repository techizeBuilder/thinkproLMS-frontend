import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Mail, Phone, MapPin } from "lucide-react";
import { schoolAdminService } from "@/api/schoolAdminService";
import { toast } from "sonner";

export default function SchoolAdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [schoolAdmin, setSchoolAdmin] = useState<any>(null);

  useEffect(() => {
    loadSchoolAdminData();
  }, []);

  const loadSchoolAdminData = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getMentors(); // Using mentors endpoint to get school admin data
      
      if (response.success) {
        setSchoolAdmin(response.data.schoolAdmin);
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your school administrator profile
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Profile Settings
          </span>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{schoolAdmin?.name || "N/A"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{schoolAdmin?.email || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{schoolAdmin?.phoneNumber || "N/A"}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Schools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Assigned Schools</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!schoolAdmin?.assignedSchool ? (
              <p className="text-muted-foreground text-center py-4">
                No school assigned to your account.
              </p>
            ) : (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{schoolAdmin.assignedSchool.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {schoolAdmin.assignedSchool.city}, {schoolAdmin.assignedSchool.state}
                    </div>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Role:</span>
              <div className="font-medium">School Administrator</div>
            </div>
            <div>
              <span className="text-muted-foreground">Account Type:</span>
              <div className="font-medium">Administrative</div>
            </div>
            <div>
              <span className="text-muted-foreground">Permissions:</span>
              <div className="font-medium">School Management</div>
            </div>
            <div>
              <span className="text-muted-foreground">Access Level:</span>
              <div className="font-medium">School-Scoped</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
