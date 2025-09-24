import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { schoolAdminService, type CreateSchoolAdminData } from "@/api/schoolAdminService";
import { schoolService, type School } from "@/api/schoolService";
import { MultiSelect } from "@/components/ui/multi-select";
import { toast } from "sonner";

export default function CreateSchoolAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine the base path based on current route
  const isLeadMentor = location.pathname.includes('/leadmentor');
  const basePath = isLeadMentor ? '/leadmentor' : '/superadmin';
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [formData, setFormData] = useState<CreateSchoolAdminData>({
    name: "",
    email: "",
    phoneNumber: "",
    assignedSchools: [],
  });
  const [creationMethod, setCreationMethod] = useState<"invite" | "credentials">("invite");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await schoolService.getAll();
      if (response.success) {
        setSchools(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch schools");
    } finally {
      setSchoolsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        createWithCredentials: creationMethod === "credentials",
        password: creationMethod === "credentials" ? password : undefined,
      };
      
      const response = await schoolAdminService.create(submitData);
      
      if (response.success) {
        toast.success(response.message || "School admin created successfully");
        navigate(`${basePath}/school-admins`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create school admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(`${basePath}/school-admins`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create School Admin</h1>
          <p className="text-gray-600">Add a new school administrator</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>School Admin Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedSchools">Assign to Schools *</Label>
              {schoolsLoading ? (
                <div className="text-sm text-gray-500">Loading schools...</div>
              ) : (
                <MultiSelect
                  options={schools.map((school) => ({
                    value: school._id,
                    label: `${school.name} - ${school.city}, ${school.state}`,
                  }))}
                  selected={formData.assignedSchools}
                  onChange={(selected) => setFormData(prev => ({ ...prev, assignedSchools: selected }))}
                  placeholder="Select schools to assign..."
                  className="w-full"
                />
              )}
              <p className="text-xs text-gray-500">
                Select one or more schools to assign to this admin
              </p>
            </div>

            <div className="space-y-4">
              <Label>Account Creation Method *</Label>
              <RadioGroup
                value={creationMethod}
                onValueChange={(value) => setCreationMethod(value as "invite" | "credentials")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite" id="invite" />
                  <Label htmlFor="invite" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Send Email Invitation</div>
                      <div className="text-sm text-gray-500">
                        Admin will receive an email to set up their password
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credentials" id="credentials" />
                  <Label htmlFor="credentials" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Create with Manual Credentials</div>
                      <div className="text-sm text-gray-500">
                        Admin will be created with provided password and auto-verified
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {creationMethod === "credentials" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password for the admin"
                  required={creationMethod === "credentials"}
                />
                <p className="text-xs text-gray-500">
                  The admin will be able to log in immediately with this password
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              {creationMethod === "invite" ? (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• An invitation email will be sent to the provided email address</li>
                  <li>• The admin will receive a setup link to create their password</li>
                  <li>• Once setup is complete, they can log in and access the school admin panel</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The admin account will be created immediately with the provided password</li>
                  <li>• The admin will be auto-verified and can log in right away</li>
                  <li>• They can access the school admin panel immediately</li>
                </ul>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || schoolsLoading || (creationMethod === "credentials" && !password)}>
                {loading 
                  ? (creationMethod === "invite" ? "Sending Invitation..." : "Creating Admin...") 
                  : (creationMethod === "invite" ? "Send Invitation" : "Create Admin")
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`${basePath}/school-admins`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
