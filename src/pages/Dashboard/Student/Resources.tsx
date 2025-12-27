import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Video, 
  FolderOpen,
  Eye,
  ExternalLink,
  Download,
  Loader2,
  Box,
  Grid3x3
} from 'lucide-react';
import type { ApiResource } from '@/types/resources';
import { useNavigate } from 'react-router-dom';
import { resourceService } from '@/api/resourceService';
import analyticsService from '@/api/analyticsService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentResourcesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBucket, setSelectedBucket] = useState<'documents' | 'videos' | '3dmodels' | 'all'>('all');
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentResources();
  }, []);

  const loadStudentResources = async () => {
    try {
      setLoading(true);
      const response = await resourceService.getByCategory('student');
      setResources(response.data || []);
    } catch (error) {
      console.error('Error loading student resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Filter resources by type
  const documentResources = resources.filter(
    resource => resource.type === 'document'
  );

  const videoResources = resources.filter(
    resource => resource.type === 'video'
  );

  const model3DResources = resources.filter(
    resource => resource.type === '3dmodel'
  );

  // Get resources based on selected bucket
  const getFilteredResources = () => {
    switch (selectedBucket) {
      case 'documents':
        return documentResources;
      case 'videos':
        return videoResources;
      case '3dmodels':
        return model3DResources;
      case 'all':
      default:
        return resources;
    }
  };

  const filteredResources = getFilteredResources();

  const handleViewResource = async (resource: ApiResource) => {
    if (resource.type === 'video' || resource.type === '3dmodel') {
      navigate(`/student/resources/${resource._id}/view`);
    } else {
      // For documents, track access and then open in new tab
      try {
        // Track document access when clicking eye icon
        await analyticsService.startAccess(resource._id, (user as any)?.grade, undefined);
      } catch (e) {
        console.error('Error tracking document access:', e);
      }
      const url = resourceService.getResourceUrl(resource);
      window.open(url, '_blank');
    }
  };

  const handleDownloadResource = (resource: ApiResource) => {
    const url = resourceService.getDownloadUrl(resource);
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResourceIcon = (type: string) => {
    if (type === 'video') return <Video className="h-5 w-5" />;
    if (type === '3dmodel') return <Box className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (resource: ApiResource) => {
    if (resource.type === '3dmodel') {
      const extension = resource.content.fileName?.split('.').pop()?.toLowerCase();
      return <Badge variant="secondary">3D {extension?.toUpperCase() || 'MODEL'}</Badge>;
    }
    
    const url = resource.content.url;
    const isExternal = resource.content.isExternal;
    
    if (isExternal) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return <Badge variant="secondary">YouTube</Badge>;
      } else if (url.includes('vimeo.com')) {
        return <Badge variant="secondary">Vimeo</Badge>;
      } else {
        return <Badge variant="secondary">Link</Badge>;
      }
    }
    
    const extension = resource.content.fileName?.split('.').pop()?.toLowerCase();
    return <Badge variant="outline">{extension?.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Learning Resources</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Access your educational materials and videos
          </p>
        </div>
      </div>

      <Tabs value={selectedBucket} onValueChange={(value: string) => setSelectedBucket(value as 'documents' | 'videos' | '3dmodels' | 'all')}>
        <TabsList className="grid w-full grid-cols-4 text-xs md:text-sm">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            All ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documentResources.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videoResources.length})
          </TabsTrigger>
          <TabsTrigger value="3dmodels" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            3D Models ({model3DResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">All Resources</h2>
            <Badge variant="outline">{filteredResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No resources available
              </div>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-base md:text-lg">{resource.title}</CardTitle>
                      </div>
                      {getFileTypeBadge(resource)}
                    </div>
                    {resource.description && (
                      <CardDescription className="text-sm md:text-base">{resource.description}</CardDescription>
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
                        {resource.type !== '3dmodel' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResource(resource)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] md:text-xs text-muted-foreground mt-2">
                      Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">Study Documents</h2>
            <Badge variant="outline">{documentResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentResources.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No document resources available
              </div>
            ) : (
              documentResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-base md:text-lg">{resource.title}</CardTitle>
                      </div>
                      {getFileTypeBadge(resource)}
                    </div>
                    {resource.description && (
                      <CardDescription className="text-sm md:text-base">{resource.description}</CardDescription>
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
                    <div className="text-[11px] md:text-xs text-muted-foreground mt-2">
                      Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">Educational Videos</h2>
            <Badge variant="outline">{videoResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoResources.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No video resources available
              </div>
            ) : (
              videoResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-base md:text-lg">{resource.title}</CardTitle>
                      </div>
                      {getFileTypeBadge(resource)}
                    </div>
                    {resource.description && (
                      <CardDescription className="text-sm md:text-base">{resource.description}</CardDescription>
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
                      </div>
                    </div>
                    <div className="text-[11px] md:text-xs text-muted-foreground mt-2">
                      Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="3dmodels" className="space-y-4">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            <h2 className="text-lg md:text-xl font-semibold">3D Models</h2>
            <Badge variant="outline">{model3DResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {model3DResources.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No 3D model resources available
              </div>
            ) : (
              model3DResources.map((resource) => (
                <Card key={resource._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-base md:text-lg">{resource.title}</CardTitle>
                      </div>
                      {getFileTypeBadge(resource)}
                    </div>
                    {resource.description && (
                      <CardDescription className="text-sm md:text-base">{resource.description}</CardDescription>
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
                      </div>
                    </div>
                    <div className="text-[11px] md:text-xs text-muted-foreground mt-2">
                      Uploaded by {resource.uploadedBy?.name || 'Unknown'} • {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
