import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  FileText, 
  ExternalLink,
  BookOpen,
  Play,
  Loader2
} from "lucide-react";
import { resourceService, type Resource } from "@/api/resourceService";
import { getFileTypeBadgeColor, formatFileSize } from "@/utils/resourceUtils";
import { toast } from "sonner";

export default function GuestResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        const response = await resourceService.getByCategory("guest");
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching guest resources:", error);
        setError("Failed to load resources");
        toast.error("Failed to load resources");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === "video") {
      navigate(`/guest/resource/${resource._id}/view`);
    } else {
      // For documents, open in new tab
      const displayUrl = resourceService.getResourceUrl(resource);
      window.open(displayUrl, '_blank');
    }
  };


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotional Resources</h1>
        <p className="text-gray-600">
          Explore our collection of promotional materials, guides, and videos to learn more about ThinkPro LMS.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Available</h3>
          <p className="text-gray-600">Check back later for new resources.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.type === "video" ? Video : FileText;
            const colorClasses = getFileTypeBadgeColor(resource);
            
            return (
              <Card key={resource._id} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleResourceClick(resource)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {resource.title}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {resource.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {resource.content.fileSize && (
                        <span>Size: {formatFileSize(resource.content.fileSize)}</span>
                      )}
                      {resource.viewCount > 0 && (
                        <span className="ml-2">{resource.viewCount} views</span>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResourceClick(resource);
                      }}
                    >
                      {resource.type === "video" && <Play className="h-4 w-4 mr-1" />}
                      {resource.type === "document" && <ExternalLink className="h-4 w-4 mr-1" />}
                      {resource.type === "video" ? "Watch" : "Open"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coming Soon Section */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              More Resources Coming Soon!
            </h3>
            <p className="text-gray-600 mb-4">
              We're constantly adding new resources, case studies, and educational content. 
              Check back regularly for updates.
            </p>
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
              <BookOpen className="h-4 w-4 mr-2" />
              Subscribe for Updates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
