import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground">
            Access educational materials for students and mentors (Read-only access)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs value={`${selectedUserType}-${selectedBucket}`} onValueChange={(value) => {
        const [userType, bucket] = value.split('-') as ['student' | 'mentor', 'documents' | 'videos'];
        setSelectedUserType(userType);
        setSelectedBucket(bucket);
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="student-documents" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Student Documents
          </TabsTrigger>
          <TabsTrigger value="student-videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Student Videos
          </TabsTrigger>
          <TabsTrigger value="mentor-documents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Mentor Documents
          </TabsTrigger>
          <TabsTrigger value="mentor-videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Mentor Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="student-documents" className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Student Documents</h2>
            <Badge variant="outline">{pagination.total} resources</Badge>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading resources...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResource(resource)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="student-videos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Student Videos</h2>
            <Badge variant="outline">{pagination.total} resources</Badge>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading resources...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.content.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentor-documents" className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Mentor Documents</h2>
            <Badge variant="outline">{pagination.total} resources</Badge>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading resources...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResource(resource)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentor-videos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Mentor Videos</h2>
            <Badge variant="outline">{pagination.total} resources</Badge>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading resources...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.content.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
