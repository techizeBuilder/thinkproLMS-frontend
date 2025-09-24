import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { schoolService, type UpdateSchoolData, type SchoolHead, type ServiceDetails } from "@/api/schoolService";
import { toast } from "sonner";
import SchoolHeadForm from "@/components/SchoolHeadForm";
import ServiceForm from "@/components/ServiceForm";
import { getMediaUrl } from "@/utils/mediaUrl";

export default function EditSchoolPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateSchoolData>({
    name: "",
    address: "",
    board: "CBSE",
    state: "",
    city: "",
    affiliatedTo: "",
    branchName: "",
    projectStartDate: "",
    projectEndDate: "",
    schoolHeads: [],
    serviceDetails: undefined,
  });

  useEffect(() => {
    if (id) {
      fetchSchool(id);
    }
  }, [id]);

  const fetchSchool = async (schoolId: string) => {
    try {
      const response = await schoolService.getById(schoolId);
      if (response.success) {
        const school = response.data;
        setFormData({
          name: school.name,
          address: school.address,
          board: school.board,
          state: school.state,
          city: school.city,
          affiliatedTo: school.affiliatedTo || "",
          branchName: school.branchName || "",
          projectStartDate: school.projectStartDate ? new Date(school.projectStartDate).toISOString().split('T')[0] : "",
          projectEndDate: school.projectEndDate ? new Date(school.projectEndDate).toISOString().split('T')[0] : "",
          schoolHeads: school.schoolHeads || [],
          serviceDetails: school.serviceDetails || undefined,
        });
        
        // Set existing file paths
        setExistingImage(school.image || null);
        setExistingLogo(school.logo || null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch school");
      navigate("/superadmin/schools");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setFormData(prev => ({
      ...prev,
      image: file || undefined
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setFormData(prev => ({
      ...prev,
      logo: file || undefined
    }));
  };

  const handleSchoolHeadsChange = (schoolHeads: SchoolHead[]) => {
    setFormData(prev => ({
      ...prev,
      schoolHeads
    }));
  };

  const handleServiceDetailsChange = (serviceDetails: ServiceDetails | null) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: serviceDetails || undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);

    try {
      const response = await schoolService.update(id, formData);
      
      if (response.success) {
        toast.success(response.message || "School updated successfully");
        navigate("/superadmin/schools");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update school");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading school...</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Edit School</h1>
          <p className="text-gray-600">Update school information</p>
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, board: value as any }))}
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
                <Label htmlFor="logo">School Logo</Label>
                <div className="space-y-2">
                  {existingLogo && (
                    <div className="text-sm text-blue-600">
                      Current logo: <a href={getMediaUrl(existingLogo) || '#'} target="_blank" rel="noopener noreferrer" className="underline">View current logo</a>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {existingLogo ? 'Replace Logo' : 'Upload Logo'}
                    </Button>
                    {logoFile && (
                      <span className="text-sm text-green-600">
                        {logoFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">School Image</Label>
                <div className="space-y-2">
                  {existingImage && (
                    <div className="text-sm text-blue-600">
                      Current image: <a href={getMediaUrl(existingImage) || '#'} target="_blank" rel="noopener noreferrer" className="underline">View current image</a>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {existingImage ? 'Replace Image' : 'Upload Image'}
                    </Button>
                    {imageFile && (
                      <span className="text-sm text-green-600">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
            {loading ? "Updating..." : "Update School"}
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
