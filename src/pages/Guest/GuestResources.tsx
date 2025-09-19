import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  FileText, 
  Download, 
  ExternalLink,
  BookOpen,
  Play
} from "lucide-react";

export default function GuestResources() {
  const resources = [
    {
      id: 1,
      title: "Platform Overview Video",
      type: "video",
      description: "Comprehensive introduction to ThinkPro LMS features and capabilities.",
      duration: "5:30",
      icon: Video,
      color: "blue"
    },
    {
      id: 2,
      title: "Feature Guide PDF",
      type: "pdf",
      description: "Detailed guide covering all platform features and functionalities.",
      size: "2.4 MB",
      icon: FileText,
      color: "red"
    },
    {
      id: 3,
      title: "Success Stories",
      type: "link",
      description: "Read testimonials from schools and students using our platform.",
      icon: ExternalLink,
      color: "purple"
    },
    {
      id: 4,
      title: "Getting Started Guide",
      type: "pdf",
      description: "Step-by-step guide to get started with ThinkPro LMS.",
      size: "1.8 MB",
      icon: BookOpen,
      color: "green"
    },
    {
      id: 5,
      title: "Demo Walkthrough",
      type: "video",
      description: "Watch a complete walkthrough of the platform in action.",
      duration: "12:45",
      icon: Play,
      color: "indigo"
    },
    {
      id: 6,
      title: "Pricing Information",
      type: "pdf",
      description: "Detailed pricing plans and subscription options.",
      size: "1.2 MB",
      icon: FileText,
      color: "orange"
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "text-blue-600 bg-blue-100",
      red: "text-red-600 bg-red-100",
      purple: "text-purple-600 bg-purple-100",
      green: "text-green-600 bg-green-100",
      indigo: "text-indigo-600 bg-indigo-100",
      orange: "text-orange-600 bg-orange-100"
    };
    return colorMap[color] || "text-gray-600 bg-gray-100";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotional Resources</h1>
        <p className="text-gray-600">
          Explore our collection of promotional materials, guides, and videos to learn more about ThinkPro LMS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          const colorClasses = getColorClasses(resource.color);
          
          return (
            <Card key={resource.id} className="shadow-md hover:shadow-lg transition-shadow">
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
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {resource.type === "video" && resource.duration && (
                      <span>Duration: {resource.duration}</span>
                    )}
                    {resource.type === "pdf" && resource.size && (
                      <span>Size: {resource.size}</span>
                    )}
                    {resource.type === "link" && (
                      <span>External Link</span>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {resource.type === "video" && <Play className="h-4 w-4 mr-1" />}
                    {resource.type === "pdf" && <Download className="h-4 w-4 mr-1" />}
                    {resource.type === "link" && <ExternalLink className="h-4 w-4 mr-1" />}
                    {resource.type === "video" ? "Watch" : resource.type === "pdf" ? "Download" : "Open"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
