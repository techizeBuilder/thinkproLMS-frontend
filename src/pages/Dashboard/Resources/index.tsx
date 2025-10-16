import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUploadCompletion } from "@/hooks/useUploadCompletion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Video,
  Plus,
  Users,
  GraduationCap,
  Eye,
  Search,
  Loader2,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Calendar,
  User,
  Filter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import type { UserType, BucketType } from "@/types/resources";
import type {
  Resource as ApiResource,
  ResourceFilters,
} from "@/api/resourceService";
import { resourceService } from "@/api/resourceService";
import {
  getResourceDisplayUrl,
  getFileTypeBadgeColor,
} from "@/utils/resourceUtils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial values from URL params or defaults
  const [selectedUserType, setSelectedUserType] = useState<UserType | "all">(
    (searchParams.get("category") as UserType | "all") || "all"
  );
  const [selectedBucket, setSelectedBucket] = useState<BucketType | "all">(
    (searchParams.get("type") as BucketType | "all") || "all"
  );

  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState<"title" | "createdAt" | "viewCount">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Check if user can see mentor resources
  const canViewMentorResources =
    user?.role === "superadmin" ||
    user?.role === "leadmentor" ||
    user?.role === "mentor";

  // Update URL parameters when filters change
  const updateURLParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // Fetch resources from API
  const fetchResources = async (page = 1) => {
    setLoading(true);
    try {
      const filters: ResourceFilters = {
        search: searchTerm || undefined,
        page,
        limit: 20, // Increased limit for table view
      };

      // Only add type filter if not 'all'
      if (selectedBucket !== "all") {
        filters.type = selectedBucket === "videos" ? "video" : "document";
      }

      let response;
      if (selectedUserType === "all") {
        // Fetch all resources regardless of category
        response = await resourceService.getAll(filters);
      } else {
        // Fetch resources by specific category
        response = await resourceService.getByCategory(
          selectedUserType,
          filters
        );
      }

      setResources(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources when filters change
  useEffect(() => {
    fetchResources(1);
  }, [selectedUserType, selectedBucket, searchTerm]);

  // Listen for upload completion and refetch resources
  useUploadCompletion(() => {
    fetchResources(1);
  });

  // Update URL when filters change
  useEffect(() => {
    updateURLParams({
      category: selectedUserType,
      type: selectedBucket,
      search: searchTerm,
    });
  }, [selectedUserType, selectedBucket, searchTerm]);

  const handleAddResource = () => {
    const basePath =
      user?.role === "superadmin" ? "/superadmin" : "/leadmentor";
    navigate(
      `${basePath}/resources/add?userType=${selectedUserType}&bucket=${selectedBucket}`
    );
  };

  const handleEditResource = (resourceId: string) => {
    const basePath =
      user?.role === "superadmin" ? "/superadmin" : "/leadmentor";
    navigate(`${basePath}/resources/${resourceId}/edit`);
  };

  const handleViewResource = (resource: ApiResource) => {
    if (resource.type === "video") {
      const basePath =
        user?.role === "superadmin" ? "/superadmin" : "/leadmentor";
      navigate(`${basePath}/resources/${resource._id}/view`);
    } else {
      // For documents, open in new tab or iframe
      const url = getResourceDisplayUrl(resource);
      window.open(url, "_blank");
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      await resourceService.delete(resourceId);
      toast.success("Resource deleted successfully");
      fetchResources(pagination.current);
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handlePageChange = (page: number) => {
    fetchResources(page);
  };

  const handleSort = (field: "title" | "createdAt" | "viewCount") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (field: "category" | "type", value: string) => {
    if (field === "category") {
      setSelectedUserType(value as UserType | "all");
    } else {
      setSelectedBucket(value as BucketType | "all");
    }
    fetchResources(1);
  };

  const getResourceIcon = (type: string) => {
    return type === "video" ? (
      <Video className="h-5 w-5" />
    ) : (
      <FileText className="h-5 w-5" />
    );
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    const extension =
      resource.content.fileName?.split(".").pop()?.toLowerCase() || "";
    const colorClass = getFileTypeBadgeColor(resource);

    if (resource.content.isExternal) {
      if (
        resource.content.url.includes("youtube.com") ||
        resource.content.url.includes("youtu.be")
      ) {
        return <Badge className="bg-red-100 text-red-800">YouTube</Badge>;
      } else if (resource.content.url.includes("vimeo.com")) {
        return <Badge className="bg-blue-100 text-blue-800">Vimeo</Badge>;
      } else {
        return <Badge className="bg-gray-100 text-gray-800">Link</Badge>;
      }
    }

    switch (extension) {
      case "pdf":
        return <Badge className={colorClass}>PDF</Badge>;
      case "doc":
      case "docx":
        return <Badge className={colorClass}>Word</Badge>;
      case "xls":
      case "xlsx":
        return <Badge className={colorClass}>Excel</Badge>;
      case "ppt":
      case "pptx":
        return <Badge className={colorClass}>PowerPoint</Badge>;
      case "mp4":
        return <Badge className={colorClass}>MP4</Badge>;
      default:
        return <Badge className={colorClass}>{extension.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources Management</h1>
          <p className="text-muted-foreground">
            Manage educational resources for mentors and students
          </p>
        </div>
        {(user?.role === "superadmin" || user?.role === "leadmentor") && (
          <Button
            onClick={handleAddResource}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select
              value={selectedUserType}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    All Resources
                  </div>
                </SelectItem>
                <SelectItem value="student">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student Resources
                  </div>
                </SelectItem>
                {canViewMentorResources && (
                  <SelectItem value="mentor">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Mentor Resources
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <Select
            value={selectedBucket}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Types
                </div>
              </SelectItem>
              <SelectItem value="documents">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </div>
              </SelectItem>
              <SelectItem value="videos">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {/* Resources Table */}
      <div className="space-y-4">
        {/* Table Header with Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {selectedUserType === "all" && selectedBucket === "all"
                ? "All Resources"
                : selectedUserType === "all"
                ? selectedBucket === "documents"
                  ? "All Documents"
                  : "All Videos"
                : selectedBucket === "all"
                ? selectedUserType === "student"
                  ? "All Student Resources"
                  : "All Mentor Resources"
                : `${selectedUserType === "student" ? "Student" : "Mentor"} ${
                    selectedBucket === "documents" ? "Documents" : "Videos"
                  }`}
            </h2>
            <Badge variant="outline" className="text-sm">
              {pagination.total} resources
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {sortBy === "title" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("viewCount")}
                >
                  <div className="flex items-center gap-2">
                    Views
                    {sortBy === "viewCount" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortBy === "createdAt" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        {getFileTypeBadge(resource)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div
                        className="max-w-[200px] truncate"
                        title={resource.title}
                      >
                        {resource.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-[250px] truncate text-sm text-gray-600"
                        title={resource.description}
                      >
                        {resource.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm text-gray-600">
                        {resource.session ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {resource.session.displayName}
                            </span>
                            {/* <span className="text-xs text-gray-500">
                              Grade {resource.session.grade} - Session {resource.session.sessionNumber}
                            </span> */}
                          </div>
                        ) : (
                          <span className="text-gray-400">No session</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {resource.tags
                          .slice(0, 2)
                          .map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        {resource.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        {resource.viewCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        {resource.uploadedBy?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResource(resource)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {resource.content.isExternal ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = getResourceDisplayUrl(resource);
                              window.open(url, "_blank");
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = getResourceDisplayUrl(resource);
                              window.open(url, "_blank");
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {(user?.role === "superadmin" ||
                          user?.role === "leadmentor") && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditResource(resource._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteResource(resource._id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.current} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
