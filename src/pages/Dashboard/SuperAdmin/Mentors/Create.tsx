import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import { toast } from "sonner";

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
    schoolId: "",
  });
  const [creationMethod, setCreationMethod] = useState<"invite" | "credentials">("invite");
  const [password, setPassword] = useState("");

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
      
      await axiosInstance.post("/mentors", submitData);
      toast.success("Mentor created successfully");
      navigate("/superadmin/mentors");
    } catch (error: any) {
      console.error("Error creating mentor:", error);
      toast.error(error.response?.data?.message || "Failed to create mentor");
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
          <h1 className="text-3xl font-bold text-gray-900">Create School Mentor</h1>
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
                        Mentor will receive an email to set up their password
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
                        Mentor will be created with provided password and auto-verified
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
                  placeholder="Enter password for the mentor"
                  required={creationMethod === "credentials"}
                />
                <p className="text-xs text-gray-500">
                  The mentor will be able to log in immediately with this password
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Assignment</CardTitle>
            <p className="text-sm text-gray-600">
              Select one school to assign to this mentor
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="schoolId">School *</Label>
              <select
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name} - {school.city}, {school.state} • {school.board}
                    {school.branchName && ` • ${school.branchName}`}
                  </option>
                ))}
              </select>
            </div>
            {!formData.schoolId && (
              <p className="text-red-500 text-sm mt-2">
                Please select a school
              </p>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          {creationMethod === "invite" ? (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An invitation email will be sent to the provided email address</li>
              <li>• The mentor will receive a setup link to create their password</li>
              <li>• Once setup is complete, they can log in and access the mentor panel</li>
            </ul>
          ) : (
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• The mentor account will be created immediately with the provided password</li>
              <li>• The mentor will be auto-verified and can log in right away</li>
              <li>• They can access the mentor panel immediately</li>
            </ul>
          )}
        </div>

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
            disabled={loading || !formData.schoolId || (creationMethod === "credentials" && !password)}
            className="flex items-center gap-2"
          >
            {loading ? (
              creationMethod === "invite" ? "Sending Invitation..." : "Creating Mentor..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {creationMethod === "invite" ? "Create Mentor & Send Invite" : "Create Mentor"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
