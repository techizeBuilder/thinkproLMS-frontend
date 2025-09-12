import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe } from "lucide-react";
import { leadMentorService, type CreateLeadMentorData } from "@/api/leadMentorService";
import { schoolService, type School } from "@/api/schoolService";
import { toast } from "sonner";

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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await leadMentorService.create(formData);
      
      if (response.success) {
        toast.success(response.message || "Lead mentor invited successfully");
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
          <h1 className="text-3xl font-bold">Invite Lead Mentor</h1>
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

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• An invitation email will be sent to the provided email address</li>
                <li>• The lead mentor will receive a setup link to create their password</li>
                <li>• Once setup is complete, they can log in and access the lead mentor panel</li>
                <li>• They will have access to manage school admins and other lead mentors</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || schoolsLoading}>
                {loading ? "Sending Invitation..." : "Send Invitation"}
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
