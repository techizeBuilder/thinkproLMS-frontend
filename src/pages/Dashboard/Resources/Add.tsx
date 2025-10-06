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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Upload,
  Link,
  FileText,
  Video,
  X,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import type { UserType, ResourceType } from "@/types/resources";
import type { CreateResourceData } from "@/api/resourceService";
import { resourceService } from "@/api/resourceService";
import { useUpload } from "@/contexts/UploadContext";
import { sessionService, type Session } from "@/api/sessionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AddResourcePage() {
  const { user } = useAuth();
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
  const [contentMethod, setContentMethod] = useState<"file" | "url">("file");

  // Session selection for student/mentor resources
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const { startUpload, updateProgress, finishUpload } = useUpload();

  // Load sessions when target audience is student or mentor
  useEffect(() => {
    const loadSessions = async () => {
      if (formData.category === "student" || formData.category === "mentor") {
        setLoadingSessions(true);
        try {
          const sessionsData = await sessionService.getAllSessions();
          setSessions(sessionsData);
        } catch (error) {
          console.error("Error loading sessions:", error);
          toast.error("Failed to load sessions");
        } finally {
          setLoadingSessions(false);
        }
      } else {
        setSessions([]);
        setSelectedSession("");
      }
    };

    loadSessions();
  }, [formData.category]);

  const handleInputChange = (field: keyof CreateResourceData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

      // Validate session selection for student/mentor resources
      if (formData.category === "student" || formData.category === "mentor") {
        if (!selectedSession) {
          toast.error("Please select a session for student/mentor resources");
          return;
        }
      }

      if (contentMethod === "file" && !formData.file) {
        toast.error("Please select a file to upload");
        return;
      }

      if (contentMethod === "url" && !formData.url) {
        toast.error("Please provide an external URL");
        return;
      }

      // Prepare the resource data with session field
      const resourceData = {
        ...formData,
        session: selectedSession || undefined,
      };

      console.log("Resource data being submitted:", resourceData);

      // Start global upload UI before starting request
      const fileName = resourceData.file?.name || (resourceData.url ? resourceData.url : "");
      startUpload({ id: `${Date.now()}`, title: resourceData.title, fileName });

      // Navigate back immediately after starting upload
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/resources`);

      // Create the resource with progress callback
      await resourceService.create(resourceData, (percent) => {
        updateProgress(percent);
      });

      finishUpload();
      toast.success("Resource created successfully!");
    } catch (error) {
      console.error("Error creating resource:", error);
      toast.error("Failed to create resource. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "document":
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getAcceptedFileTypes = (type: string) => {
    switch (type) {
      case "video":
        return "video/mp4,video/avi,video/mov,video/wmv";
      case "document":
      default:
        return ".pdf,.pptx,.xlsx,.docx,.doc,.xls,.ppt";
    }
  };

  const getFileTypeDescription = (type: string) => {
    switch (type) {
      case "video":
        return "Supported formats: MP4, AVI, MOV, WMV";
      case "document":
      default:
        return "Supported formats: PDF, PPTX, XLSX, DOCX, DOC, XLS, PPT";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
            navigate(`${basePath}/resources`);
          }}
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic details about the resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>

        {/* Session Selection - Only show for student/mentor resources */}
        {(formData.category === "student" || formData.category === "mentor") && (
          <Card>
            <CardHeader>
              <CardTitle>Session Association</CardTitle>
              <CardDescription>
                Link this resource to a specific session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session">Session *</Label>
                <Popover open={sessionSelectOpen} onOpenChange={setSessionSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sessionSelectOpen}
                      className="w-full justify-between"
                      disabled={loadingSessions}
                    >
                      {selectedSession
                        ? sessions.find((session) => session._id === selectedSession)
                          ? `${sessions.find((session) => session._id === selectedSession)?.grade}.${sessions.find((session) => session._id === selectedSession)?.sessionNumber?.toString().padStart(2, '0')} ${sessions.find((session) => session._id === selectedSession)?.name}`
                          : "Select session..."
                        : "Select session..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search sessions..." />
                      <CommandList>
                        <CommandEmpty>No sessions found.</CommandEmpty>
                        <CommandGroup>
                          {sessions.map((session) => (
                            <CommandItem
                              key={session._id}
                              value={`${session.grade}.${session.sessionNumber?.toString().padStart(2, '0')} ${session.name}`}
                              onSelect={() => {
                                setSelectedSession(session._id!);
                                setSessionSelectOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedSession === session._id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {session.grade}.{session.sessionNumber?.toString().padStart(2, '0')} {session.name}
                                </span>
                                {session.module && (
                                  <span className="text-sm text-gray-500">{typeof session.module === 'string' ? session.module : session.module.name}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {loadingSessions && (
                  <p className="text-sm text-muted-foreground">Loading sessions...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Type and Method */}
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>
              Choose the resource type and how you want to provide the content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource Type Selection */}
            <div className="space-y-3">
              <Label>Resource Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value as ResourceType)}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="document" id="document" />
                  <Label htmlFor="document" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Document
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                    <Video className="h-4 w-4" />
                    Video
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Content Method Selection */}
            <div className="space-y-3">
              <Label>How would you like to provide the content?</Label>
              <RadioGroup
                value={contentMethod}
                onValueChange={(value) => setContentMethod(value as "file" | "url")}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="file" id="file-method" />
                  <Label htmlFor="file-method" className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="url" id="url-method" />
                  <Label htmlFor="url-method" className="flex items-center gap-2 cursor-pointer">
                    <Link className="h-4 w-4" />
                    External URL
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Content Input Based on Method */}
            {contentMethod === "file" ? (
              <div className="space-y-3">
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    accept={getAcceptedFileTypes(formData.type)}
                    className="hidden"
                  />
                  <Label htmlFor="file" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      {getFileIcon(formData.type)}
                      <span className="text-sm font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500">
                        {getFileTypeDescription(formData.type)}
                      </span>
                    </div>
                  </Label>
                </div>
                {formData.file && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    {getFileIcon(formData.type)}
                    <span className="text-sm">{formData.file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
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
                <p className="text-sm text-gray-500">
                  {formData.type === "video"
                    ? "YouTube, Vimeo, or direct video links"
                    : "Direct links to documents or external resources"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
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
            onClick={() => {
              const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
              navigate(`${basePath}/resources`);
            }}
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