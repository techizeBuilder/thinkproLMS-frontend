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
import { useHasPermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';

export default function ResourcesWithAPIPage() {
  const { user } = useAuth();
  const { hasPermission } = useHasPermission();
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
  const canViewMentorResources = user?.role === 'leadmentor' || user?.role === 'mentor';

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
    navigate(`/leadmentor/resources/add?userType=${selectedUserType}&bucket=${selectedBucket}`);
  };

  const handleEditResource = (resourceId: string) => {
    navigate(`/leadmentor/resources/${resourceId}/edit`);
  };

  const handleViewResource = (resource: ApiResource) => {
    if (resource.type === 'video') {
      navigate(`/leadmentor/resources/${resource._id}/view`);
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

  const getResourceIcon = (type: string) => {
    return type === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    const extension = resource.content.fileName?.split('.').pop()?.toLowerCase() || '';
    const colorClass = getFileTypeBadgeColor(resource);
    
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources(1);
  };

  const handlePageChange = (page: number) => {
    fetchResources(page);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-gray-600">
          Manage and organize learning resources for students and mentors
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
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

      {/* User Type Tabs */}
      <Tabs value={selectedUserType} onValueChange={(value) => setSelectedUserType(value as UserType)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="student" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Student Resources
          </TabsTrigger>
          {canViewMentorResources && (
            <TabsTrigger value="mentor" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mentor Resources
            </TabsTrigger>
          )}
          <TabsTrigger value="guest" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guest Resources
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Resources
          </TabsTrigger>
        </TabsList>

        {/* Student Resources */}
        <TabsContent value="student" className="mt-6">
          <Tabs value={selectedBucket} onValueChange={(value) => setSelectedBucket(value as BucketType)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Student Documents</h2>
                {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Document
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
                          {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
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

            <TabsContent value="videos">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Student Videos</h2>
                {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Video
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
          </Tabs>
        </TabsContent>

        {/* Mentor Resources */}
        {canViewMentorResources && (
          <TabsContent value="mentor" className="mt-6">
            <Tabs value={selectedBucket} onValueChange={(value) => setSelectedBucket(value as BucketType)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Mentor Documents</h2>
                  {user?.role === 'leadmentor' && (
                    <Button onClick={handleAddResource} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Document
                    </Button>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                      <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getResourceIcon(resource.type)}
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                            </div>
                            {getFileTypeBadge(resource)}
                          </div>
                          <CardDescription className="line-clamp-2">
                            {resource.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FolderOpen className="h-4 w-4" />
                              <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
                            {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
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

              <TabsContent value="videos">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Mentor Videos</h2>
                  {user?.role === 'leadmentor' && (
                    <Button onClick={handleAddResource} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Video
                    </Button>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map((resource) => (
                      <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getResourceIcon(resource.type)}
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                            </div>
                            {getFileTypeBadge(resource)}
                          </div>
                          <CardDescription className="line-clamp-2">
                            {resource.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FolderOpen className="h-4 w-4" />
                              <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
            </Tabs>
          </TabsContent>
        )}

        {/* Guest Resources */}
        <TabsContent value="guest" className="mt-6">
          <Tabs value={selectedBucket} onValueChange={(value) => setSelectedBucket(value as BucketType)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Guest Documents</h2>
                  {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Document
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
                          {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
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
            </TabsContent>

            <TabsContent value="videos">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Guest Videos</h2>
                {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Video
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
                          {hasPermission(PERMISSIONS.ADD_RESOURCES) && (
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
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* All Resources */}
        <TabsContent value="all" className="mt-6">
          <Tabs value={selectedBucket} onValueChange={(value) => setSelectedBucket(value as BucketType)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">All Documents</h2>
                {user?.role === 'leadmentor' && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Document
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
            </TabsContent>

            <TabsContent value="videos">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">All Videos</h2>
                {user?.role === 'leadmentor' && (
                  <Button onClick={handleAddResource} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Video
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <Card key={resource._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getResourceIcon(resource.type)}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                          </div>
                          {getFileTypeBadge(resource)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FolderOpen className="h-4 w-4" />
                            <span>Uploaded by {resource.uploadedBy?.name || 'Unknown'}</span>
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
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
