import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Upload,
  Link,
  FileText,
  Video,
  X,
  Plus,
} from "lucide-react";
import type { UserType, ResourceType } from "@/types/resources";
import type { CreateResourceData } from "@/api/resourceService";
import { resourceService } from "@/api/resourceService";
import { moduleService } from "@/api/moduleService";
import { schoolService } from "@/api/schoolService";
import { toast } from "sonner";

export default function AddResourcePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<CreateResourceData>({
    title: "",
    description: "",
    type: "document",
    category: (searchParams.get("userType") as UserType) || "student",
    url: "",
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  // Additional form data for conditional fields
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedModule, setSelectedModule] = useState<string>("");

  // Data for dropdowns
  const [schools, setSchools] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [availableGrades, setAvailableGrades] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load subjects and schools
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [subjectsData, schoolsData] = await Promise.all([
          moduleService.getAllModules(),
          schoolService.getAllSchools(),
        ]);

        setSubjects(subjectsData);
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof CreateResourceData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle school selection and load grades
  const handleSchoolChange = async (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedGrade("");
    setSelectedSubject("");
    setSelectedModule("");
    setModules([]);

    if (schoolId) {
      try {
        const response = await schoolService.getServiceDetails(schoolId);
        if (response.success && response.data.hasServiceDetails) {
          console.log("Available grades from API:", response.data.grades);
          setAvailableGrades(response.data.grades);
        } else {
          setAvailableGrades([]);
        }
      } catch (error) {
        console.error("Error loading school grades:", error);
        toast.error("Failed to load school grades");
      }
    } else {
      setAvailableGrades([]);
    }
  };

  // Helper function to extract numeric grade from various formats
  const extractNumericGrade = (gradeString: string): number | null => {
    if (!gradeString) return null;
    
    // Try direct parsing first (in case it's already a number string)
    const directParse = parseInt(gradeString, 10);
    if (!isNaN(directParse)) return directParse;
    
    // Extract all numbers from the string
    const numbers = gradeString.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0], 10);
    }
    
    return null;
  };

  // Handle subject selection and load modules
  const handleSubjectChange = async (subjectId: string, grade: string) => {
    setSelectedSubject(subjectId);
    setSelectedModule("");

    if (subjectId && grade) {
      try {
        console.log("Grade value received:", grade, "Type:", typeof grade);
        const numericGrade = extractNumericGrade(grade);
        console.log("Extracted numeric grade:", numericGrade);
        
        if (numericGrade === null) {
          console.error("Invalid grade format:", grade);
          toast.error("Invalid grade format");
          setModules([]);
          return;
        }

        const response = await moduleService.getModulesByGradeAndSubject(
          numericGrade,
          subjectId
        );
        setModules(response.modules || []);
      } catch (error) {
        console.error("Error loading modules:", error);
        setModules([]);
      }
    } else {
      setModules([]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.type || !formData.category) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate conditional fields for student/mentor resources
      if (formData.category === "student" || formData.category === "mentor") {
        if (!selectedSchool || !selectedGrade || !selectedSubject) {
          toast.error(
            "Please select school, grade, and subject for student/mentor resources"
          );
          return;
        }
      }

      if (activeTab === "file" && !formData.file) {
        toast.error("Please select a file to upload");
        return;
      }

      if (activeTab === "url" && !formData.url) {
        toast.error("Please provide an external URL");
        return;
      }

      // Prepare the resource data with additional fields
      const resourceData = {
        ...formData,
        school: selectedSchool || undefined,
        grade: selectedGrade || undefined,
        subject: selectedSubject || undefined,
        module: selectedModule || undefined,
      };

      console.log("Resource data being submitted:", resourceData);

      // Create the resource
      await resourceService.create(resourceData);

      toast.success("Resource created successfully!");
      navigate("/leadmentor/resources");
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error("Failed to create resource. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTabChange = (tab: "file" | "url") => {
    setActiveTab(tab);
    if (tab === "file") {
      setFormData((prev) => ({ ...prev, url: "" }));
    } else {
      setFormData((prev) => ({ ...prev, file: undefined }));
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/leadmentor/resources")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Resource</h1>
          <p className="text-muted-foreground">
            Create a new educational resource for {formData.category}s
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Information</CardTitle>
            <CardDescription>
              Provide basic information about the resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter resource title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Target Audience *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: UserType) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="mentor">Mentors</SelectItem>
                    <SelectItem value="guest">Guests</SelectItem>
                    <SelectItem value="all">All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe the resource content and purpose"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Resource Type *</Label>
              <Tabs
                value={formData.type}
                onValueChange={(value: string) =>
                  handleInputChange("type", value as ResourceType)
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="document"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Document
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Fields - Only show for student/mentor resources */}
        {(formData.category === "student" ||
          formData.category === "mentor") && (
          <Card>
            <CardHeader>
              <CardTitle>Targeting Details</CardTitle>
              <CardDescription>
                Specify the school, grade, subject, and module for this resource
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Selection */}
                <div className="space-y-2">
                  <Label htmlFor="school">School *</Label>
                  <Select
                    value={selectedSchool}
                    onValueChange={handleSchoolChange}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school._id} value={school._id}>
                          {school.name} - {school.city}, {school.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Selection */}
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade *</Label>
                  <Select
                    value={selectedGrade}
                    onValueChange={(value) => {
                      setSelectedGrade(value);
                      setSelectedSubject("");
                      setSelectedModule("");
                      setModules([]);
                    }}
                    disabled={!selectedSchool || availableGrades.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGrades.map((grade) => (
                        <SelectItem key={grade.grade} value={grade.grade}>
                          {grade.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={selectedSubject}
                    onValueChange={(value) =>
                      handleSubjectChange(value, selectedGrade)
                    }
                    disabled={!selectedGrade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Module Selection */}
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select
                    value={selectedModule}
                    onValueChange={setSelectedModule}
                    disabled={!selectedSubject || modules.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a module (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module._id} value={module._id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Resource Content</CardTitle>
            <CardDescription>
              Upload a file or provide a URL link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                handleTabChange(value as "file" | "url")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    accept={
                      formData.type === "video"
                        ? "video/mp4,video/avi,video/mov"
                        : ".pdf,.pptx,.xlsx,.docx"
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.type === "video"
                      ? "Supported formats: MP4, AVI, MOV"
                      : "Supported formats: PDF, PPTX, XLSX, DOCX"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Resource URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    placeholder={
                      formData.type === "video"
                        ? "https://youtube.com/watch?v=... or https://vimeo.com/..."
                        : "https://example.com/document.pdf"
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.type === "video"
                      ? "YouTube, Vimeo, or direct video links"
                      : "Direct links to documents or external resources"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Add tags to help categorize and search for this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/leadmentor/resources")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Creating..." : "Create Resource"}
          </Button>
        </div>
      </form>
    </div>
  );
}

