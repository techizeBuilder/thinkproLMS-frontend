import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import {
  schoolService,
  type CreateSchoolData,
  type SchoolHead,
  type ServiceDetails,
} from "@/api/schoolService";
import { toast } from "sonner";
import SchoolHeadForm from "@/components/SchoolHeadForm";
import ServiceForm from "@/components/ServiceForm";

export default function CreateSchoolPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contractDocumentFile, setContractDocumentFile] = useState<File | null>(
    null
  );
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: "",
    address: "",
    board: "CBSE",
    state: "",
    city: "",
    image: "",
    logo: "",
    affiliatedTo: "",
    branchName: "",
    contractStartDate: "",
    contractEndDate: "",
    projectStartDate: "",
    projectEndDate: "",
    schoolHeads: [],
    serviceDetails: undefined,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContractDocumentUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    setContractDocumentFile(file);
    setFormData((prev) => ({
      ...prev,
      contractDocument: file || undefined,
    }));
  };

  const handleSchoolHeadsChange = (schoolHeads: SchoolHead[]) => {
    setFormData((prev) => ({
      ...prev,
      schoolHeads,
    }));
  };

  const handleServiceDetailsChange = (
    serviceDetails: ServiceDetails | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      serviceDetails: serviceDetails || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await schoolService.create(formData);

      if (response.success) {
        toast.success(response.message || "School created successfully");
        navigate("/superadmin/schools");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create school");
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
          onClick={() => navigate("/superadmin/schools")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create School</h1>
          <p className="text-gray-600">Add a new school to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic School Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Board *</Label>
                <Select
                  value={formData.board}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, board: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliatedTo">Affiliated To</Label>
                <Input
                  id="affiliatedTo"
                  name="affiliatedTo"
                  value={formData.affiliatedTo}
                  onChange={handleInputChange}
                  placeholder="Enter affiliation details (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="Enter logo URL (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">School Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract and Project Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Contract & Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractStartDate">Contract Start Date</Label>
                <Input
                  id="contractStartDate"
                  name="contractStartDate"
                  type="date"
                  value={formData.contractStartDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract End Date</Label>
                <Input
                  id="contractEndDate"
                  name="contractEndDate"
                  type="date"
                  value={formData.contractEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectStartDate">Project Start Date</Label>
                <Input
                  id="projectStartDate"
                  name="projectStartDate"
                  type="date"
                  value={formData.projectStartDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectEndDate">Project End Date</Label>
                <Input
                  id="projectEndDate"
                  name="projectEndDate"
                  type="date"
                  value={formData.projectEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractDocument">Contract Signed Document</Label>
              <div className="flex items-center gap-4">
                <input
                  id="contractDocument"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleContractDocumentUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("contractDocument")?.click()
                  }
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Contract Document
                </Button>
                {contractDocumentFile && (
                  <span className="text-sm text-green-600">
                    {contractDocumentFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* School Heads */}
        <Card>
          <CardHeader>
            <CardTitle>School Heads</CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolHeadForm
              schoolHeads={formData.schoolHeads || []}
              onChange={handleSchoolHeadsChange}
            />
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceForm
              serviceDetails={formData.serviceDetails}
              onChange={handleServiceDetailsChange}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Creating..." : "Create School"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/superadmin/schools")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
