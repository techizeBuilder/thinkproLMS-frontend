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
  User
} from 'lucide-react';
import type { Resource } from '@/types/resources';

// Mock resource data - in real app, this would come from API
const mockResource: Resource = {
  id: '3',
  title: 'Science Experiments Demo',
  description: 'Video demonstration of science experiments for students',
  type: 'video',
  userType: 'student',
  bucket: 'videos',
  url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  uploadedAt: new Date('2024-01-12'),
  updatedAt: new Date('2024-01-12'),
  uploadedBy: 'Lead Mentor',
  tags: ['science', 'experiments', 'demo'],
  isActive: true
};

export default function ViewResourcePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResource(mockResource);
        setViewCount(42); // Mock view count
      } catch (error) {
        console.error('Error loading resource:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadResource();
    }
  }, [id]);

  const getEmbedUrl = (url: string): string => {
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // For direct video files, return as is
    return url;
  };

  const getVideoSource = (url: string): 'youtube' | 'vimeo' | 'direct' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  };

  const handleExternalOpen = () => {
    if (resource?.url) {
      window.open(resource.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading video...</p>
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
          <Button onClick={() => navigate('/leadmentor/resources')}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  const videoSource = getVideoSource(resource.url || '');
  const embedUrl = getEmbedUrl(resource.url || '');

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leadmentor/resources')}
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
                {videoSource === 'direct' ? (
                  <video
                    controls
                    className="w-full h-full"
                    src={resource.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={resource.title}
                  />
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
                <span>{viewCount} views</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Uploaded {resource.uploadedAt.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>By {resource.uploadedBy}</span>
              </div>

              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Target Audience:</p>
                <Badge variant={resource.userType === 'student' ? 'default' : 'secondary'}>
                  {resource.userType === 'student' ? 'Students' : 'Mentors'}
                </Badge>
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
                onClick={() => navigate(`/leadmentor/resources/${resource.id}/edit`)}
              >
                Edit Resource
              </Button>
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
