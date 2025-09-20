import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  board: string;
  branchName?: string;
}

export default function CreateMentorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    salutation: "",
    address: "",
    email: "",
    phoneNumber: "",
    schoolIds: [] as string[],
  });

  const salutations = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];

  useEffect(() => {
    fetchSchools();
  }, []);

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
    setLoading(true);

    try {
      await axiosInstance.post("/mentors", formData);
      navigate("/superadmin/mentors");
    } catch (error: any) {
      console.error("Error creating mentor:", error);
      alert(error.response?.data?.message || "Failed to create mentor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/superadmin/mentors")}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add School Mentor</h1>
          <p className="text-gray-600">Create a new mentor account and assign schools</p>
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
                <Label htmlFor="salutation">Salutation *</Label>
                <select
                  id="salutation"
                  name="salutation"
                  value={formData.salutation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Salutation</option>
                  {salutations.map(salutation => (
                    <option key={salutation} value={salutation}>
                      {salutation}
                    </option>
                  ))}
                </select>
              </div>
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
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="mentor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
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
                        {school.city}, {school.state} • {school.board}
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
            onClick={() => navigate("/superadmin/mentors")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || formData.schoolIds.length === 0}
            className="flex items-center gap-2"
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Mentor & Send Invite
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
