import { useState, useEffect, useRef } from 'react';
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
import type { Resource } from '@/api/resourceService';
import { resourceService } from '@/api/resourceService';
import { getResourceDisplayUrl } from '@/utils/resourceUtils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import analyticsService from '@/api/analyticsService';

export default function ViewResourcePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionIndex, setSessionIndex] = useState<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastProgressSentAtRef = useRef<number>(0);
  const lastVideoPositionRef = useRef<number>(0);
  const videoPlayStartTimeRef = useRef<number | null>(null);
  const isVideoPlayingRef = useRef<boolean>(false);
  const externalVideoWatchTimeRef = useRef<number>(0);
  const externalVideoStartTimeRef = useRef<number | null>(null);

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
        const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
        navigate(`${basePath}/resources`);
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [id, navigate]);

  // Start/stop tracking when resource is loaded
  useEffect(() => {
    const startTracking = async () => {
      if (!resource) return;
      try {
        // For documents, always track access when page loads
        const started = await analyticsService.startAccess(resource._id, (user as any)?.grade, (user as any)?.className);
        setSessionIndex(started.sessionIndex);
        
        // Only start heartbeat for videos (not needed for documents)
        if (resource.type === 'video') {
          heartbeatRef.current = window.setInterval(() => {
            if (started.sessionIndex != null) {
              analyticsService.heartbeat(resource._id, started.sessionIndex, 10).catch(() => {});
            }
          }, 10000);
        }
      } catch (e) {
        console.error('Error starting access tracking:', e);
      }
    };

    startTracking();

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (resource && sessionIndex != null) {
        analyticsService.endAccess(resource._id, sessionIndex).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?._id]);

  // Track external video (YouTube/Vimeo) watch time
  useEffect(() => {
    if (!resource || !resource.content.isExternal || resource.type !== 'video' || sessionIndex == null) return;

    // Track watch time for external videos using visibility and focus tracking
    const trackExternalVideo = () => {
      if (document.visibilityState === 'visible' && document.hasFocus()) {
        if (!externalVideoStartTimeRef.current) {
          externalVideoStartTimeRef.current = Date.now();
        }
      } else {
        if (externalVideoStartTimeRef.current) {
          const watched = (Date.now() - externalVideoStartTimeRef.current) / 1000;
          externalVideoWatchTimeRef.current += watched;
          externalVideoStartTimeRef.current = null;
        }
      }
    };

    // Send progress every 30 seconds for external videos
    const progressInterval = setInterval(() => {
      if (externalVideoWatchTimeRef.current > 0 && sessionIndex != null) {
        const timeToSend = externalVideoWatchTimeRef.current;
        externalVideoWatchTimeRef.current = 0;
        
        analyticsService.videoProgress({
          resourceId: resource._id,
          sessionIndex,
          playedDeltaSeconds: timeToSend,
          lastPositionSeconds: 0,
          totalDurationSeconds: 0,
          completed: false,
        }).catch(() => {});
      }
    }, 30000);

    document.addEventListener('visibilitychange', trackExternalVideo);
    window.addEventListener('blur', () => {
      if (externalVideoStartTimeRef.current) {
        const watched = (Date.now() - externalVideoStartTimeRef.current) / 1000;
        externalVideoWatchTimeRef.current += watched;
        externalVideoStartTimeRef.current = null;
      }
    });
    window.addEventListener('focus', () => {
      if (document.visibilityState === 'visible') {
        externalVideoStartTimeRef.current = Date.now();
      }
    });

    if (document.visibilityState === 'visible' && document.hasFocus()) {
      externalVideoStartTimeRef.current = Date.now();
    }

    return () => {
      clearInterval(progressInterval);
      document.removeEventListener('visibilitychange', trackExternalVideo);
      if (externalVideoStartTimeRef.current) {
        const watched = (Date.now() - externalVideoStartTimeRef.current) / 1000;
        externalVideoWatchTimeRef.current += watched;
      }
      if (externalVideoWatchTimeRef.current > 0 && sessionIndex != null) {
        analyticsService.videoProgress({
          resourceId: resource._id,
          sessionIndex,
          playedDeltaSeconds: externalVideoWatchTimeRef.current,
          lastPositionSeconds: 0,
          totalDurationSeconds: 0,
          completed: false,
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource?._id, resource?.content.isExternal, resource?.type, sessionIndex]);

  const handleExternalOpen = async () => {
    if (resource?.content.url) {
      // Track document access when opened externally - this counts as an access
      if (resource.type === 'document') {
        try {
          // For documents, end current session if exists, then start a new one (increments access count)
          if (sessionIndex != null) {
            await analyticsService.endAccess(resource._id, sessionIndex);
          }
          // Start new access session (this will increment accessCount in backend)
          const started = await analyticsService.startAccess(resource._id, (user as any)?.grade, undefined);
          setSessionIndex(started.sessionIndex);
        } catch (e) {
          console.error('Error tracking document access:', e);
        }
      }
      const url = getResourceDisplayUrl(resource);
      window.open(url, '_blank');
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
          <Button onClick={() => {
            const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
            navigate(`${basePath}/resources`);
          }}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  const embedUrl = resourceService.getIframeUrl(resource);
  const isVideo = resource.type === 'video';

  return (
    <div className="container mx-auto p-6 max-w-6xl">
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
        {/* Video/Content Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {isVideo ? (
                  resource.content.isExternal ? (
                    <iframe
                      ref={iframeRef}
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={resource.title}
                      onLoad={() => {
                        if (document.visibilityState === 'visible' && document.hasFocus()) {
                          externalVideoStartTimeRef.current = Date.now();
                        }
                      }}
                    />
                  ) : (
                    <video
                      controls
                      className="w-full h-full"
                    src={resourceService.getResourceUrl(resource)}
                    ref={videoRef}
                    onPlay={() => {
                      if (videoRef.current) {
                        isVideoPlayingRef.current = true;
                        videoPlayStartTimeRef.current = Date.now();
                        lastVideoPositionRef.current = videoRef.current.currentTime || 0;
                      }
                    }}
                    onPause={() => {
                      if (videoRef.current && isVideoPlayingRef.current && videoPlayStartTimeRef.current) {
                        isVideoPlayingRef.current = false;
                        const elapsed = (Date.now() - videoPlayStartTimeRef.current) / 1000;
                        const actualPlayed = Math.min(elapsed, videoRef.current.currentTime - lastVideoPositionRef.current);
                        if (actualPlayed > 0 && sessionIndex != null) {
                          analyticsService.videoProgress({
                            resourceId: resource._id,
                            sessionIndex,
                            playedDeltaSeconds: actualPlayed,
                            lastPositionSeconds: Math.floor(videoRef.current.currentTime || 0),
                            totalDurationSeconds: Math.floor(videoRef.current.duration || 0),
                            completed: videoRef.current.currentTime >= (videoRef.current.duration || 0) - 1,
                          }).catch(() => {});
                        }
                        videoPlayStartTimeRef.current = null;
                      }
                    }}
                    onTimeUpdate={() => {
                      if (!resource || sessionIndex == null || !videoRef.current || !isVideoPlayingRef.current) return;
                      const now = Date.now();
                      const el = videoRef.current;
                      
                      // Send progress every 10 seconds or on significant position change
                      if (now - lastProgressSentAtRef.current >= 10000 || Math.abs(el.currentTime - lastVideoPositionRef.current) >= 5) {
                        const timeDiff = el.currentTime - lastVideoPositionRef.current;
                        if (timeDiff > 0 && timeDiff <= 15) { // Sanity check: max 15 seconds between updates
                          lastProgressSentAtRef.current = now;
                          lastVideoPositionRef.current = el.currentTime;
                          
                          analyticsService.videoProgress({
                            resourceId: resource._id,
                            sessionIndex,
                            playedDeltaSeconds: timeDiff,
                            lastPositionSeconds: Math.floor(el.currentTime || 0),
                            totalDurationSeconds: Math.floor(el.duration || 0),
                            completed: el.currentTime >= (el.duration || 0) - 1,
                          }).catch(() => {});
                        }
                      }
                    }}
                    onEnded={() => {
                      if (videoRef.current && sessionIndex != null) {
                        const finalPosition = videoRef.current.currentTime || 0;
                        const timeDiff = finalPosition - lastVideoPositionRef.current;
                        if (timeDiff > 0) {
                          analyticsService.videoProgress({
                            resourceId: resource._id,
                            sessionIndex,
                            playedDeltaSeconds: timeDiff,
                            lastPositionSeconds: Math.floor(finalPosition),
                            totalDurationSeconds: Math.floor(videoRef.current.duration || 0),
                            completed: true,
                          }).catch(() => {});
                        }
                        isVideoPlayingRef.current = false;
                        videoPlayStartTimeRef.current = null;
                      }
                    }}
                  >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <ExternalLink className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">Document Resource</p>
                      <p className="text-sm text-gray-600 mb-4">
                        {resource.content.fileName || 'External Document'}
                      </p>
                      <Button onClick={handleExternalOpen} className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open Document
                      </Button>
                    </div>
                  </div>
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
                {isVideo ? <Play className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                {isVideo ? 'Video' : 'Document'} Details
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
                <p className="text-sm font-medium mb-2">Target Audience:</p>
                <Badge variant={
                  resource.category === 'student' ? 'default' : 
                  resource.category === 'mentor' ? 'secondary' :
                  resource.category === 'guest' ? 'outline' : 'destructive'
                }>
                  {resource.category === 'student' ? 'Students' : 
                   resource.category === 'mentor' ? 'Mentors' :
                   resource.category === 'guest' ? 'Guests' : 'All Users'}
                </Badge>
              </div>

              {resource.subject && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Subject:</p>
                  <Badge variant="outline">{resource.subject.name}</Badge>
                </div>
              )}

              {resource.grade && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Grade:</p>
                  <Badge variant="outline">{resource.grade}</Badge>
                </div>
              )}

              {resource.module && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Module:</p>
                  <Badge variant="outline">{resource.module.name}</Badge>
                </div>
              )}

              {resource.school && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">School:</p>
                  <Badge variant="outline">{resource.school.name}</Badge>
                </div>
              )}
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
                onClick={() => {
                  const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
                  navigate(`${basePath}/resources/${resource._id}/edit`);
                }}
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
