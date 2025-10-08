import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Calendar,
  User,
  Loader2,
  Video,
} from "lucide-react";
import type { Resource } from "@/api/resourceService";
import { resourceService } from "@/api/resourceService";
import {
  getResourceDisplayUrl,
  getVideoIframeUrl,
  getFileTypeBadgeColor,
  formatFileSize,
} from "@/utils/resourceUtils";
import { toast } from "sonner";

export default function GuestResourceViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    const loadResource = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await resourceService.getById(id);
        setResource(response.data);
      } catch (error) {
        console.error("Error loading resource:", error);
        toast.error("Failed to load resource");
        navigate("/guest/resources");
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [id, navigate]);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  const handleIframeError = () => {
    setIsIframeLoading(false);
    setIframeError("Failed to load video");
  };

  const handleExternalOpen = () => {
    if (resource?.content.url) {
      const url = getResourceDisplayUrl(resource);
      window.open(url, "_blank");
    }
  };

  const handleDownload = () => {
    if (resource) {
      const downloadUrl = resourceService.getDownloadUrl(resource);
      window.open(downloadUrl, "_blank");
    }
  };

  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
            <p className="text-gray-600">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Resource not found</p>
          <Button onClick={() => navigate("/guest/resources")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/guest/resources")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resource.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {resource.viewCount} views
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(resource.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {resource.uploadedBy.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getFileTypeBadgeColor(resource)}>
              {resource.type.toUpperCase()}
            </Badge>
            {resource.content.fileSize && (
              <span className="text-sm text-gray-500">
                {formatFileSize(resource.content.fileSize)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div
        className={`${
          showFullscreen ? "fixed inset-0 z-50 bg-white" : "h-[600px]"
        }`}
      >
        <Card className={`${showFullscreen ? "h-full" : "h-full"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5" />
              <div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getFileTypeBadgeColor(resource)}>
                    {resource.type.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {resource.content.fileSize &&
                      formatFileSize(resource.content.fileSize)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {resource.viewCount} views
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {showFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <div className="h-full">
              {resource.type === "video" ? (
                <div className="relative w-full h-full">
                  {isIframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Loading video...</p>
                      </div>
                    </div>
                  )}
                  {iframeError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Video className="h-12 w-12 mx-auto mb-2 text-red-400" />
                        <p className="text-red-600">{iframeError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExternalOpen}
                          className="mt-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Check if it's a direct video file or external video (YouTube/Vimeo) */}
                  {!resource.content.isExternal ? (
                    // Direct video file - use HTML5 video player
                    <video
                      src={getResourceDisplayUrl(resource)}
                      className="w-full h-full"
                      controls
                      onLoadStart={() => setIsIframeLoading(false)}
                      onError={handleIframeError}
                      onLoadedData={() => setIsIframeLoading(false)}
                      title={resource.title}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    // External video (YouTube/Vimeo) - use iframe
                    <iframe
                      src={getVideoIframeUrl(resource)}
                      className="w-full h-full border-0"
                      allowFullScreen
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      title={resource.title}
                    />
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {isIframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <ExternalLink className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Loading document...</p>
                      </div>
                    </div>
                  )}
                  {iframeError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <ExternalLink className="h-12 w-12 mx-auto mb-2 text-red-400" />
                        <p className="text-red-600">{iframeError}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExternalOpen}
                          className="mt-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  )}
                  <iframe
                    src={getResourceDisplayUrl(resource)}
                    className="w-full h-full border-0"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={resource.title}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Details */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resource.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Description
                </h4>
                <p className="text-gray-600">{resource.description}</p>
              </div>
            )}

            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {resource.type === "document" && (
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button variant="outline" onClick={handleDownload}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button variant="outline" onClick={handleExternalOpen}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
