import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ExternalLink, 
  Play, 
  Eye,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import type { ApiResource } from '@/types/resources';
import { resourceService } from '@/api/resourceService';
import { toast } from 'sonner';

export default function StudentResourceViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [resource, setResource] = useState<ApiResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResource = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await resourceService.getById(id);
        setResource(response.data);
      } catch (error) {
        console.error('Error loading resource:', error);
        toast.error('Failed to load resource');
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [id]);

  const handleExternalOpen = () => {
    if (resource?.content.url) {
      window.open(resource.content.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested resource could not be found.
          </p>
          <Button onClick={() => navigate('/student/resources')}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  const embedUrl = resourceService.getIframeUrl(resource);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/student/resources')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{resource.title}</h1>
          <p className="text-muted-foreground">
            {resource.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExternalOpen}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open External
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {resource.content.isExternal ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={resource.title}
                  />
                ) : (
                  <video
                    controls
                    className="w-full h-full"
                    src={resourceService.getResourceUrl(resource)}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Video Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                <span>{resource.viewCount} views</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Uploaded {new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>By {resource.uploadedBy?.name || 'Unknown'}</span>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium mb-2">For:</p>
                <Badge variant="default">Students</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resource.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExternalOpen}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
