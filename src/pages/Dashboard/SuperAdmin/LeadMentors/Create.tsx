import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Globe, Shield } from "lucide-react";
import { leadMentorService, type CreateLeadMentorData } from "@/api/leadMentorService";
import { schoolService, type School } from "@/api/schoolService";
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/constants/permissions";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";

export default function CreateLeadMentorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine the base path based on current route
  const isLeadMentor = location.pathname.includes('/leadmentor');
  const basePath = isLeadMentor ? '/leadmentor' : '/superadmin';
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [formData, setFormData] = useState<CreateLeadMentorData>({
    name: "",
    email: "",
    phoneNumber: "",
    assignedSchools: [],
    hasAccessToAllSchools: false,
    permissions: [],
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSchoolToggle = (schoolId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedSchools: prev.assignedSchools?.includes(schoolId)
        ? prev.assignedSchools.filter(id => id !== schoolId)
        : [...(prev.assignedSchools || []), schoolId]
    }));
  };

  const handleAllSchoolsToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      hasAccessToAllSchools: checked,
      assignedSchools: checked ? [] : prev.assignedSchools
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...(prev.permissions || []), permission]
    }));
  };

  const handleSelectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: Object.values(PERMISSIONS)
    }));
  };

  const handleClearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before submission
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        createWithCredentials: creationMethod === "credentials",
        password: creationMethod === "credentials" ? password : undefined,
      };
      
      const response = await leadMentorService.create(submitData);
      
      if (response.success) {
        toast.success(response.message || "Lead mentor created successfully");
        navigate(`${basePath}/lead-mentors`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create lead mentor");
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
          onClick={() => navigate(`${basePath}/lead-mentors`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Lead Mentor</h1>
          <p className="text-gray-600">Add a new lead mentor</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Lead Mentor Information</CardTitle>
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

            <PhoneInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
              required
            />

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
                        Lead mentor will receive an email to set up their password
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
                        Lead mentor will be created with provided password and auto-verified
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
                  placeholder="Enter password for the lead mentor"
                  required={creationMethod === "credentials"}
                />
                <p className="text-xs text-gray-500">
                  The lead mentor will be able to log in immediately with this password
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Label>School Access</Label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasAccessToAllSchools"
                  checked={formData.hasAccessToAllSchools}
                  onChange={(e) => handleAllSchoolsToggle(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="hasAccessToAllSchools" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Grant access to all schools
                </Label>
              </div>

              {!formData.hasAccessToAllSchools && (
                <div className="space-y-3">
                  <Label>Assign Specific Schools</Label>
                  {schoolsLoading ? (
                    <div className="text-sm text-gray-500">Loading schools...</div>
                  ) : schools.length === 0 ? (
                    <div className="text-sm text-gray-500">No schools available. Please create schools first.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {schools.map((school) => (
                        <div key={school._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`school-${school._id}`}
                            checked={formData.assignedSchools?.includes(school._id) || false}
                            onChange={() => handleSchoolToggle(school._id)}
                            className="rounded border-gray-300"
                          />
                          <Label 
                            htmlFor={`school-${school._id}`} 
                            className="flex-1 text-sm cursor-pointer"
                          >
                            <div className="font-medium">{school.name}</div>
                            <div className="text-gray-500">{school.city}, {school.state}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Permissions
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllPermissions}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearAllPermissions}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 border rounded-md p-4">
                {Object.values(PERMISSIONS).map((permission) => (
                  <div key={permission} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={`permission-${permission}`}
                      checked={formData.permissions?.includes(permission) || false}
                      onChange={() => handlePermissionToggle(permission)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={`permission-${permission}`} 
                        className="cursor-pointer font-medium"
                      >
                        {PERMISSION_LABELS[permission as keyof typeof PERMISSION_LABELS]}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              {creationMethod === "invite" ? (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• An invitation email will be sent to the provided email address</li>
                  <li>• The lead mentor will receive a setup link to create their password</li>
                  <li>• Once setup is complete, they can log in and access the lead mentor panel</li>
                  <li>• They will have access to manage school admins and other lead mentors</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The lead mentor account will be created immediately with the provided password</li>
                  <li>• The lead mentor will be auto-verified and can log in right away</li>
                  <li>• They can access the lead mentor panel immediately</li>
                  <li>• They will have access to manage school admins and other lead mentors</li>
                </ul>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || schoolsLoading || (creationMethod === "credentials" && !password)}>
                {loading 
                  ? (creationMethod === "invite" ? "Sending Invitation..." : "Creating Lead Mentor...") 
                  : (creationMethod === "invite" ? "Send Invitation" : "Create Lead Mentor")
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`${basePath}/lead-mentors`)}
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
