import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import { toast } from "sonner";

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
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
  };
  address: string;
  phoneNumber: string;
  assignedSchools: School[];
  isActive: boolean;
}

export default function EditMentorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [schools, setSchools] = useState<School[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    schoolIds: [] as string[],
  });


  useEffect(() => {
    if (id) {
      fetchMentor();
      fetchSchools();
    }
  }, [id]);

  const fetchMentor = async () => {
    try {
      const response = await axiosInstance.get(`/mentors/${id}`);
      const mentorData = response.data.data;
      setMentor(mentorData);
      setFormData({
        name: mentorData.user.name,
        address: mentorData.address,
        phoneNumber: mentorData.phoneNumber,
        schoolIds: mentorData.assignedSchools.map((school: School) => school._id),
      });
    } catch (error) {
      console.error("Error fetching mentor:", error);
      alert("Failed to fetch mentor details");
    } finally {
      setFetching(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/schools");
      setSchools(response.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSchoolToggle = (schoolId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      schoolIds: checked
        ? [...prev.schoolIds, schoolId]
        : prev.schoolIds.filter(id => id !== schoolId)
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
      await axiosInstance.put(`/mentors/${id}`, formData);
      toast.success("Mentor updated successfully");
      navigate("/leadmentor/mentors");
    } catch (error: any) {
      console.error("Error updating mentor:", error);
      toast.error(error.response?.data?.message || "Failed to update mentor");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6">Loading mentor details...</div>;
  }

  if (!mentor) {
    return <div className="p-6">Mentor not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/leadmentor/mentors")}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit School Mentor</h1>
          <p className="text-gray-600">Update mentor information and school assignments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mentor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  value={mentor.user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <PhoneInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Assignment</CardTitle>
            <p className="text-sm text-gray-600">
              Select one or more schools to assign to this mentor
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {schools.map((school) => (
                <div key={school._id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={school._id}
                    checked={formData.schoolIds.includes(school._id)}
                    onCheckedChange={(checked) => 
                      handleSchoolToggle(school._id, checked as boolean)
                    }
                  />
                  <Label htmlFor={school._id} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-gray-500">
                        {school.city}, {school.state}
                        {school.boards && school.boards.length > 0 && ` • ${school.boards.join(", ")}`}
                        {school.branchName && ` • ${school.branchName}`}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
            {formData.schoolIds.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one school
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/leadmentor/mentors")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || formData.schoolIds.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Updating..."
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Mentor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
