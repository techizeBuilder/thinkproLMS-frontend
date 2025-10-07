import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { schoolAdminService, type SchoolAdmin, type UpdateSchoolAdminData } from "@/api/schoolAdminService";
import { schoolService, type School } from "@/api/schoolService";
import { MultiSelect } from "@/components/ui/multi-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import { toast } from "sonner";

export default function EditSchoolAdminPage() {
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
  const [formData, setFormData] = useState<UpdateSchoolAdminData>({
    phoneNumber: "",
    assignedSchools: [],
    isActive: true,
  });
  const [schoolAdmin, setSchoolAdmin] = useState<SchoolAdmin | null>(null);

  useEffect(() => {
    if (id) {
      fetchSchoolAdmin(id);
    }
    fetchSchools();
  }, [id]);

  const fetchSchoolAdmin = async (adminId: string) => {
    try {
      const response = await schoolAdminService.getAll();
      if (response.success) {
        const admin = response.data.find(a => a._id === adminId);
        if (admin) {
          setSchoolAdmin(admin);
          setFormData({
            phoneNumber: admin.phoneNumber,
            assignedSchools: admin.assignedSchools.map(s => s._id),
            isActive: admin.isActive,
          });
        } else {
          toast.error("School admin not found");
          navigate(`${basePath}/school-admins`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch school admin");
      navigate(`${basePath}/school-admins`);
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
      const response = await schoolAdminService.update(id, formData);
      
      if (response.success) {
        toast.success(response.message || "School admin updated successfully");
        navigate(`${basePath}/school-admins`);
      } else {
        toast.error(response.message || "Failed to update school admin");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update school admin");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading school admin...</div>
      </div>
    );
  }

  if (!schoolAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">School admin not found</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit School Admin</h1>
          <p className="text-gray-600">Update school administrator information</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>School Admin Information</CardTitle>
          <p className="text-sm text-gray-600">
            Editing: {schoolAdmin.user.name} ({schoolAdmin.user.email})
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PhoneInput
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
              required
            />

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
                  selected={formData.assignedSchools || []}
                  onChange={(selected) => setFormData(prev => ({ ...prev, assignedSchools: selected }))}
                  placeholder="Select schools to assign..."
                  className="w-full"
                />
              )}
              <p className="text-xs text-gray-500">
                Select one or more schools to assign to this admin
              </p>
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
                {loading ? "Updating..." : "Update School Admin"}
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
