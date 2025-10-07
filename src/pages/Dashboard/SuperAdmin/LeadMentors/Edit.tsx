import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Shield } from "lucide-react";
import { leadMentorService, type LeadMentor, type UpdateLeadMentorData } from "@/api/leadMentorService";
import { schoolService, type School } from "@/api/schoolService";
import { MultiSelect } from "@/components/ui/multi-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/constants/permissions";
import { toast } from "sonner";

export default function EditLeadMentorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  // Determine the base path based on current route
  const isLeadMentor = location.pathname.includes('/leadmentor');
  const basePath = isLeadMentor ? '/leadmentor' : '/superadmin';
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateLeadMentorData>({
    phoneNumber: "",
    assignedSchools: [],
    hasAccessToAllSchools: false,
    permissions: [],
    isActive: true,
  });
  const [leadMentor, setLeadMentor] = useState<LeadMentor | null>(null);

  useEffect(() => {
    if (id) {
      fetchLeadMentor(id);
    }
    fetchSchools();
  }, [id]);

  const fetchLeadMentor = async (mentorId: string) => {
    try {
      const response = await leadMentorService.getById(mentorId);
      if (response.success) {
        const mentor = response.data;
        setLeadMentor(mentor);
        setFormData({
          phoneNumber: mentor.phoneNumber || "",
          assignedSchools: mentor.assignedSchools.map(s => s._id),
          hasAccessToAllSchools: mentor.hasAccessToAllSchools,
          permissions: mentor.permissions || [],
          isActive: mentor.isActive,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch lead mentor");
      navigate(`${basePath}/lead-mentors`);
    } finally {
      setFetchLoading(false);
    }
  };

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
    if (!id) return;
    
    // Validate phone number before submission
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setLoading(true);

    try {
      const response = await leadMentorService.update(id, formData);
      
      if (response.success) {
        toast.success(response.message || "Lead mentor updated successfully");
        navigate(`${basePath}/lead-mentors`);
      } else {
        toast.error(response.message || "Failed to update lead mentor");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update lead mentor");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading lead mentor...</div>
      </div>
    );
  }

  if (!leadMentor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Lead mentor not found</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit Lead Mentor</h1>
          <p className="text-gray-600">Update lead mentor information</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Lead Mentor Information</CardTitle>
          <p className="text-sm text-gray-600">
            Editing: {leadMentor.user.name} ({leadMentor.user.email})
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              label="Phone Number"
              value={formData.phoneNumber || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
              required
            />

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
                    <MultiSelect
                      options={schools.map((school) => ({
                        value: school._id,
                        label: `${school.name} - ${school.city}, ${school.state}`,
                      }))}
                      selected={formData.assignedSchools || []}
                      onChange={(selected) => setFormData(prev => ({ ...prev, assignedSchools: selected }))}
                      placeholder="Select schools to assign..."
                      className="w-full"
                    />
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || schoolsLoading}>
                {loading ? "Updating..." : "Update Lead Mentor"}
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
