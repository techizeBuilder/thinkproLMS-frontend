import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Video, 
  Users, 
  GraduationCap,
  Eye,
  ExternalLink,
  Download,
  Search,
  Loader2,
  Calendar,
  Box,
  User,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import type { UserType, BucketType } from '@/types/resources';
import type { Resource as ApiResource, ResourceFilters } from '@/api/resourceService';
import { resourceService } from '@/api/resourceService';
import {
  getResourceDisplayUrl,
  getFileTypeBadgeColor,
} from '@/utils/resourceUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MentorResourcesPage() {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<UserType>('student');
  const [selectedBucket, setSelectedBucket] = useState<BucketType | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string | 'all'>('all');
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'viewCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Fetch resources from API
  const fetchResources = async (page = 1) => {
    setLoading(true);
    try {
      const filters: ResourceFilters = {
        category: selectedUserType,
        search: searchTerm || undefined,
        page,
        limit: 20, // Increased limit for table view
      };

      // Only add type filter if not 'all'
      if (selectedBucket !== 'all') {
        filters.type = selectedBucket === 'videos' ? 'video' : 'document';
      }

      // Add grade filter if selected
      if (selectedGrade !== 'all') {
        filters.grade = String(selectedGrade);
      }

      // Use getAll for mentors since they can access both student and mentor resources
      const response = await resourceService.getAll(filters);
      setResources(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources when filters change
  useEffect(() => {
    fetchResources(1);
  }, [selectedUserType, selectedBucket, searchTerm, selectedGrade]);

  const handlePageChange = (page: number) => {
    fetchResources(page);
  };

  const handleSort = (field: 'title' | 'createdAt' | 'viewCount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handleViewResource = (resource: ApiResource) => {
    if (resource.type === 'video' || resource.type === '3dmodel') {
      navigate(`/mentor/resources/${resource._id}/view`);
    } else {
      // For documents, open in new tab or iframe
      const url = getResourceDisplayUrl(resource);
      window.open(url, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    if (type === 'video') return <Video className="h-5 w-5" />;
    if (type === '3dmodel') return <Box className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    const extension =
      resource.content.fileName?.split('.').pop()?.toLowerCase() || '';
    const colorClass = getFileTypeBadgeColor(resource);

    if (resource.content.isExternal) {
      if (
        resource.content.url.includes('youtube.com') ||
        resource.content.url.includes('youtu.be')
      ) {
        return <Badge className="bg-red-100 text-red-800">YouTube</Badge>;
      } else if (resource.content.url.includes('vimeo.com')) {
        return <Badge className="bg-blue-100 text-blue-800">Vimeo</Badge>;
      } else {
        return <Badge className="bg-gray-100 text-gray-800">Link</Badge>;
      }
    }

    switch (extension) {
      case 'pdf':
        return <Badge className={colorClass}>PDF</Badge>;
      case 'doc':
      case 'docx':
        return <Badge className={colorClass}>Word</Badge>;
      case 'xls':
      case 'xlsx':
        return <Badge className={colorClass}>Excel</Badge>;
      case 'ppt':
      case 'pptx':
        return <Badge className={colorClass}>PowerPoint</Badge>;
      case 'mp4':
        return <Badge className={colorClass}>MP4</Badge>;
      default:
        return <Badge className={colorClass}>{extension.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Learning Resources</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Access educational materials (Read-only)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filters (dropdowns like superadmin/resources) */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedUserType} onValueChange={(v: UserType) => {
          setSelectedUserType(v);
          // Reset grade filter when switching category
          setSelectedGrade('all');
        }}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">
              <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Student</div>
            </SelectItem>
            <SelectItem value="mentor">
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /> Mentor</div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedBucket} onValueChange={(v: BucketType | 'all') => setSelectedBucket(v)}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> All Types</div>
            </SelectItem>
            <SelectItem value="documents">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</div>
            </SelectItem>
            <SelectItem value="videos">
              <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Videos</div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedGrade} onValueChange={(value) => setSelectedGrade(value as string | 'all')}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue placeholder="Select grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((g) => (
              <SelectItem key={g} value={g}>Grade {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Table */}
      <div className="space-y-4">
        {/* Table Header with Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {selectedUserType === 'student' ? 'Student' : 'Mentor'} {
                selectedBucket === 'all' 
                  ? 'Resources' 
                  : selectedBucket === 'videos' 
                    ? 'Videos' 
                    : 'Documents'
              }
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
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {sortBy === 'title' &&
                      (sortOrder === 'asc' ? (
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
                  onClick={() => handleSort('viewCount')}
                >
                  <div className="flex items-center gap-2">
                    Views
                    {sortBy === 'viewCount' &&
                      (sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortBy === 'createdAt' &&
                      (sortOrder === 'asc' ? (
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
                        {resource.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm text-gray-600">
                        {resource.session ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {resource.session.displayName}
                            </span>
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
                        {resource.uploadedBy?.name || 'Unknown'}
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
                              window.open(url, '_blank');
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
                              window.open(url, '_blank');
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
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
