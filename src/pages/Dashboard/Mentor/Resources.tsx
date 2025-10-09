import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  FileText, 
  Video, 
  Users, 
  GraduationCap,
  FolderOpen,
  Eye,
  ExternalLink,
  Download,
  Search,
  Loader2
} from 'lucide-react';
import type { UserType, BucketType } from '@/types/resources';
import type { Resource as ApiResource, ResourceFilters } from '@/api/resourceService';
import { resourceService } from '@/api/resourceService';
import { getResourceDisplayUrl } from '@/utils/resourceUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MentorResourcesPage() {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<UserType>('student');
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('documents');
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        type: selectedBucket === 'videos' ? 'video' : 'document',
        category: selectedUserType,
        search: searchTerm || undefined,
        page,
        limit: 10,
      };

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
  }, [selectedUserType, selectedBucket, searchTerm]);

  const handleViewResource = (resource: ApiResource) => {
    if (resource.type === 'video') {
      navigate(`/mentor/resources/${resource._id}/view`);
    } else {
      // For documents, open in new tab or iframe
      const url = getResourceDisplayUrl(resource);
      window.open(url, '_blank');
    }
  };

  const handleDownloadResource = (resource: ApiResource) => {
    if (resource.content.url) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resource.content.url;
      link.download = resource.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getResourceIcon = (type: string) => {
    return type === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    const url = resource.content.url;
    if (!url) return null;
    
    const extension = url.split('.').pop()?.toLowerCase();
    const isLink = url.startsWith('http');
    
    if (isLink) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return <Badge variant="secondary">YouTube</Badge>;
      } else if (url.includes('vimeo.com')) {
        return <Badge variant="secondary">Vimeo</Badge>;
      } else {
        return <Badge variant="secondary">Link</Badge>;
      }
    }
    
    return <Badge variant="outline">{extension?.toUpperCase()}</Badge>;
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
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      {/* Filters (dropdowns like superadmin/resources) */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedUserType} onValueChange={(v: UserType) => setSelectedUserType(v)}>
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

        <Select value={selectedBucket} onValueChange={(v: BucketType) => setSelectedBucket(v)}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="documents">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</div>
            </SelectItem>
            <SelectItem value="videos">
              <div className="flex items-center gap-2"><Video className="h-4 w-4" /> Videos</div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-2">
          {(selectedBucket === 'videos') ? (
            <Video className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <FolderOpen className="h-4 w-4 md:h-5 md:w-5" />
          )}
          <h2 className="text-lg md:text-xl font-semibold">
            {selectedUserType === 'student' ? 'Student' : 'Mentor'} {selectedBucket === 'videos' ? 'Videos' : 'Documents'}
          </h2>
          <Badge variant="outline" className="text-xs">{pagination.total}</Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            <span className="ml-2 text-sm md:text-base">Loading...</span>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-sm md:text-lg truncate">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource)}
                  </div>
                  {resource.description && (
                    <CardDescription className="text-xs md:text-sm line-clamp-2">{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                        className="flex-1 text-xs md:text-sm"
                      >
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (resource.type === 'video') {
                            const url = getResourceDisplayUrl(resource);
                            window.open(url, '_blank');
                          } else {
                            handleDownloadResource(resource);
                          }
                        }}
                        className="flex-1 text-xs md:text-sm"
                      >
                        {(resource.type === 'video') ? (
                          <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        ) : (
                          <Download className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        )}
                        {(resource.type === 'video') ? 'Open' : 'Download'}
                      </Button>
                    </div>
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-2 truncate">
                    By {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
