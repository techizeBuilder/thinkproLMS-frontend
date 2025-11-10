import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { schoolService, type UpdateSchoolData, type ServiceDetails } from "@/api/schoolService";
import { toast } from "sonner";
import ServiceForm from "@/components/ServiceForm";
import StateDistrictSelector from "@/components/StateDistrictSelector";
import { getMediaUrl } from "@/utils/mediaUrl";
import { locationService } from "@/api/locationService";

export default function EditSchoolPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const locationInitRef = useRef(false);
  const [formData, setFormData] = useState<UpdateSchoolData>({
    name: "",
    address: "",
    boards: [],
    state: "",
    city: "",
    district: "",
    stateId: "",
    districtId: "",
    pinCode: "",
    schoolEmail: "",
    schoolWebsite: "",
    principalName: "",
    principalContact: "",
    principalEmail: "",
    stemCoordinatorName: "",
    stemCoordinatorContact: "",
    stemCoordinatorEmail: "",
    affiliatedTo: "",
    branchName: "",
    projectStartDate: "",
    projectEndDate: "",
    serviceDetails: undefined,
    students_strength: 0,
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
          boards: school.boards || [],
          state: school.state,
          city: school.city || "",
          district: school.district || "",
          pinCode: school.pinCode || "",
          schoolEmail: school.schoolEmail || "",
          schoolWebsite: school.schoolWebsite || "",
          principalName: school.principalName || "",
          principalContact: school.principalContact || "",
          principalEmail: school.principalEmail || "",
          stemCoordinatorName: school.stemCoordinatorName || "",
          stemCoordinatorContact: school.stemCoordinatorContact || "",
          stemCoordinatorEmail: school.stemCoordinatorEmail || "",
          affiliatedTo: school.affiliatedTo || "",
          branchName: school.branchName || "",
          projectStartDate: school.projectStartDate ? new Date(school.projectStartDate).toISOString().split('T')[0] : "",
          projectEndDate: school.projectEndDate ? new Date(school.projectEndDate).toISOString().split('T')[0] : "",
          serviceDetails: school.serviceDetails || undefined,
          stateId: "",
          districtId: "",
          students_strength: school.students_strength || 0,
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

  useEffect(() => {
    const populateLocationIds = async () => {
      if (locationInitRef.current) return;
      const stateName = formData.state;
      const districtName = formData.district;
      if (!stateName || !districtName) return;

      try {
        const states = await locationService.getStates();
        const matchedState = states.find(
          (state) =>
            state.name.trim().toLowerCase() === stateName.trim().toLowerCase()
        );

        if (!matchedState) {
          locationInitRef.current = true;
          return;
        }

        const districts = await locationService.getDistricts(matchedState._id);
        const matchedDistrict = districts.find(
          (district) =>
            district.name.trim().toLowerCase() ===
            districtName.trim().toLowerCase()
        );

        setFormData((prev) => ({
          ...prev,
          stateId: matchedState._id,
          districtId: matchedDistrict?._id ?? "",
          district: matchedDistrict?.name ?? prev.district,
          city: prev.city || matchedDistrict?.name || "",
        }));
      } catch (error) {
        console.error("Failed to populate state/district IDs", error);
      } finally {
        locationInitRef.current = true;
      }
    };

    populateLocationIds();
  }, [formData.state, formData.district]);

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


  const handleServiceDetailsChange = (serviceDetails: ServiceDetails | null) => {
    setFormData(prev => ({
      ...prev,
      serviceDetails: serviceDetails || undefined
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      { field: 'name', label: 'School Name' },
      { field: 'address', label: 'Address' },
      { field: 'state', label: 'State' },
      { field: 'district', label: 'District' },
      { field: 'city', label: 'City' },
      { field: 'pinCode', label: 'PIN Code' },
      { field: 'schoolEmail', label: 'School Email' },
      { field: 'principalName', label: 'Principal Name' },
      { field: 'principalContact', label: 'Principal Contact' },
      { field: 'principalEmail', label: 'Principal Email' }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof UpdateSchoolData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    // Check if boards are selected
    if (!formData.boards || formData.boards.length === 0) {
      missingFields.push({ field: 'boards', label: 'Board' });
    }

    // Check service details
    if (!formData.serviceDetails) {
      missingFields.push({ field: 'serviceDetails', label: 'Service Details' });
    } else {
      // Check mentor type
      if (!formData.serviceDetails.mentors || formData.serviceDetails.mentors.length === 0) {
        missingFields.push({ field: 'mentors', label: 'Mentor Type' });
      }
      
      // Check grades
      if (!formData.serviceDetails.grades || formData.serviceDetails.grades.length === 0) {
        missingFields.push({ field: 'grades', label: 'Grades' });
      } else {
        // Check if all grades have valid sections
        const invalidGrades = formData.serviceDetails.grades.some(gradeData => 
          !gradeData.sections || 
          gradeData.sections.length === 0 || 
          gradeData.sections.some(section => !section || section.trim() === '')
        );
        
        if (invalidGrades) {
          missingFields.push({ field: 'sections', label: 'Grade Sections' });
        }
      }
    }

    return missingFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // Validate required fields
    const missingFields = validateForm();
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.label).join(', ');
      toast.error(`Please fill in the following required fields: ${fieldNames}`);
      return;
    }
    
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
                <Label>Board *</Label>
                <div className="flex flex-wrap items-center gap-4 border border-gray-300 rounded-md p-3">
                  {["CBSE", "ICSE", "State Board", "IGCSE", "IB", "Other"].map((board) => (
                    <div key={board} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`board-${board}`}
                        name="board"
                        value={board}
                        checked={formData.boards?.includes(board as any)}
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            boards: [board as any],
                          }));
                        }}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`board-${board}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {board}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select one board
                </p>
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

            <StateDistrictSelector
              selectedStateId={formData.stateId}
              selectedStateName={formData.state}
              selectedDistrictId={formData.districtId}
              selectedDistrictName={formData.district}
              onStateChange={(state) =>
                setFormData((prev) => ({
                  ...prev,
                  state: state?.name ?? "",
                  stateId: state?.id ?? "",
                  district: "",
                  districtId: "",
                  city: "",
                }))
              }
              onDistrictChange={(district) =>
                setFormData((prev) => ({
                  ...prev,
                  district: district?.name ?? "",
                  districtId: district?.id ?? "",
                }))
              }
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode">PIN Code *</Label>
                <Input
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter PIN code"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolEmail">School Email *</Label>
                <Input
                  id="schoolEmail"
                  name="schoolEmail"
                  type="email"
                  value={formData.schoolEmail}
                  onChange={handleInputChange}
                  placeholder="Enter school email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolWebsite">School Website</Label>
                <Input
                  id="schoolWebsite"
                  name="schoolWebsite"
                  type="url"
                  value={formData.schoolWebsite}
                  onChange={handleInputChange}
                  placeholder="Enter school website (optional)"
                />
              </div>
            </div>

            {/* Principal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Principal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal Name *</Label>
                  <Input
                    id="principalName"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleInputChange}
                    placeholder="Enter principal name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principalContact">Principal Contact *</Label>
                  <Input
                    id="principalContact"
                    name="principalContact"
                    value={formData.principalContact}
                    onChange={handleInputChange}
                    placeholder="Enter principal contact"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principalEmail">Principal Email *</Label>
                  <Input
                    id="principalEmail"
                    name="principalEmail"
                    type="email"
                    value={formData.principalEmail}
                    onChange={handleInputChange}
                    placeholder="Enter principal email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="students_strength">Students Strength *</Label>
                  <Input
                    id="students_strength"
                    name="students_strength"
                    type="number"
                    min="1"
                    value={formData.students_strength}
                    onChange={handleInputChange}
                    placeholder="Enter number of students"
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEM Coordinator Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">STEM Coordinator Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stemCoordinatorName">STEM Coordinator Name</Label>
                  <Input
                    id="stemCoordinatorName"
                    name="stemCoordinatorName"
                    value={formData.stemCoordinatorName}
                    onChange={handleInputChange}
                    placeholder="Enter STEM coordinator name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stemCoordinatorContact">STEM Coordinator Contact</Label>
                  <Input
                    id="stemCoordinatorContact"
                    name="stemCoordinatorContact"
                    value={formData.stemCoordinatorContact}
                    onChange={handleInputChange}
                    placeholder="Enter STEM coordinator contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stemCoordinatorEmail">STEM Coordinator Email</Label>
                  <Input
                    id="stemCoordinatorEmail"
                    name="stemCoordinatorEmail"
                    type="email"
                    value={formData.stemCoordinatorEmail}
                    onChange={handleInputChange}
                    placeholder="Enter STEM coordinator email"
                  />
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div> */}

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
        {/* <Card>
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
        </Card> */}


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
