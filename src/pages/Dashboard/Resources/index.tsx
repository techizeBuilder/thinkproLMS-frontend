import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Video, 
  Plus, 
  Users, 
  GraduationCap,
  FolderOpen,
  Eye,
  Search,
  Loader2,
} from 'lucide-react';
import type { UserType, BucketType } from '@/types/resources';
import type { Resource as ApiResource, ResourceFilters } from '@/api/resourceService';
import { resourceService } from '@/api/resourceService';
import { getResourceDisplayUrl, getFileTypeBadgeColor, formatFileSize } from '@/utils/resourceUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


export default function ResourcesPage() {
  const { user } = useAuth();
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

  // Check if user can see mentor resources
  const canViewMentorResources = user?.role === 'superadmin' || user?.role === 'leadmentor' || user?.role === 'mentor';

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

      const response = await resourceService.getByCategory(selectedUserType, filters);
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

  const handleAddResource = () => {
    const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
    navigate(`${basePath}/resources/add?userType=${selectedUserType}&bucket=${selectedBucket}`);
  };

  const handleEditResource = (resourceId: string) => {
    const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
    navigate(`${basePath}/resources/${resourceId}/edit`);
  };

  const handleViewResource = (resource: ApiResource) => {
    if (resource.type === 'video') {
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/resources/${resource._id}/view`);
    } else {
      // For documents, open in new tab or iframe
      const url = getResourceDisplayUrl(resource);
      window.open(url, '_blank');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await resourceService.delete(resourceId);
      toast.success('Resource deleted successfully');
      fetchResources(pagination.current);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handlePageChange = (page: number) => {
    fetchResources(page);
  };

  const getResourceIcon = (type: string) => {
    return type === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    const extension = resource.content.fileName?.split('.').pop()?.toLowerCase() || '';
    const colorClass = getFileTypeBadgeColor(resource);
    
    if (resource.content.isExternal) {
      if (resource.content.url.includes('youtube.com') || resource.content.url.includes('youtu.be')) {
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources Management</h1>
          <p className="text-muted-foreground">
            Manage educational resources for mentors and students
          </p>
        </div>
        {(user?.role === 'superadmin' || user?.role === 'leadmentor') && (
          <Button onClick={handleAddResource} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      <Tabs value={`${selectedUserType}-${selectedBucket}`} onValueChange={(value) => {
        const [userType, bucket] = value.split('-') as [UserType, BucketType];
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
          {canViewMentorResources && (
            <>
              <TabsTrigger value="mentor-documents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mentor Documents
              </TabsTrigger>
              <TabsTrigger value="mentor-videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Mentor Videos
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="student-documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Student Documents</h2>
              <Badge variant="outline">{pagination.total} resources</Badge>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FolderOpen className="h-4 w-4" />
                        <span>Uploaded by {resource.uploadedBy.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{resource.viewCount} views</span>
                      </div>
                      {resource.content.fileSize && (
                        <div className="text-sm text-gray-600">
                          Size: {formatFileSize(resource.content.fileSize)}
                        </div>
                      )}
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {user?.role === 'leadmentor' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResource(resource._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteResource(resource._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
        </TabsContent>

        <TabsContent value="student-videos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Student Videos</h2>
              <Badge variant="outline">{pagination.total} resources</Badge>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FolderOpen className="h-4 w-4" />
                        <span>Uploaded by {resource.uploadedBy.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{resource.viewCount} views</span>
                      </div>
                      {resource.content.fileSize && (
                        <div className="text-sm text-gray-600">
                          Size: {formatFileSize(resource.content.fileSize)}
                        </div>
                      )}
                      {resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {user?.role === 'leadmentor' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResource(resource._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteResource(resource._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
        </TabsContent>

        {canViewMentorResources && (
          <>
            <TabsContent value="mentor-documents" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Mentor Documents</h2>
                  <Badge variant="outline">{pagination.total} resources</Badge>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            <span>{resource.viewCount} views</span>
                          </div>
                          {resource.content.fileSize && (
                            <div className="text-sm text-gray-600">
                              Size: {formatFileSize(resource.content.fileSize)}
                            </div>
                          )}
                          {resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResource(resource)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {user?.role === 'leadmentor' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditResource(resource._id)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource._id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

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
            </TabsContent>

            <TabsContent value="mentor-videos" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Mentor Videos</h2>
                  <Badge variant="outline">{pagination.total} resources</Badge>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            <span>{resource.viewCount} views</span>
                          </div>
                          {resource.content.fileSize && (
                            <div className="text-sm text-gray-600">
                              Size: {formatFileSize(resource.content.fileSize)}
                            </div>
                          )}
                          {resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResource(resource)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {user?.role === 'leadmentor' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditResource(resource._id)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteResource(resource._id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

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
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
