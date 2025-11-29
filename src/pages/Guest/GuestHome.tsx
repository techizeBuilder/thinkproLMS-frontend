import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  FileText,
  Puzzle,
  Calendar,
  CreditCard,
  Phone,
  BookOpen,
  Video,
  Download,
  ExternalLink,
} from "lucide-react";

export default function GuestHome() {
  const [hasViewedWelcomeVideo, setHasViewedWelcomeVideo] = useState(false);

  const handleRequestDemo = () => {
    // TODO: Implement demo request functionality
    alert("Demo request functionality will be implemented soon!");
  };

  const handleRequestCallback = () => {
    // TODO: Implement callback request functionality
    alert("Callback request functionality will be implemented soon!");
  };

  const handleSubscribe = () => {
    // TODO: Implement subscription functionality
    alert("Subscription functionality will be implemented soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Welcome to ThinkPro LMS
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Explore our platform, access promotional content, and discover how
            we can enhance your learning experience.
          </p>
        </div>

        {/* Welcome Video Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Play className="h-6 w-6 text-green-600" />
              Welcome Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Introduction to ThinkPro LMS
              </h3>
              <p className="text-gray-600 mb-4">
                Watch our welcome video to learn about our platform and how it
                can benefit you.
              </p>
              <Button
                onClick={() => setHasViewedWelcomeVideo(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Play Welcome Video
              </Button>
              {hasViewedWelcomeVideo && (
                <Badge className="ml-4 bg-green-100 text-green-800">
                  Video Watched
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              Promotional Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Sample Resources */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <Video className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Platform Overview
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Learn about our comprehensive learning management system and
                  its features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Watch Video
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Feature Guide
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Download our comprehensive guide to understand all platform
                  features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Success Stories
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Read testimonials from schools and students who have benefited
                  from our platform.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Read More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card className="mb-6 sm:mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Puzzle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              Interactive Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <Puzzle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Knowledge Quiz
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Test your knowledge with our interactive quiz and see how much
                  you know about learning management systems.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Puzzle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Take Quiz
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Online Classes
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Register for our free online demonstration classes to see the
                  platform in action.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Register for Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Content Section */}
        <Card className="mb-6 sm:mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              Premium Content
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 sm:p-6 border border-green-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Unlock Premium Videos
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                Access our premium video content with advanced learning
                materials and expert insights.
              </p>
              <Button
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base h-10 sm:h-11 touch-manipulation">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe to Premium
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              Get in Touch
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Request a Demo
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Schedule a personalized demonstration of our platform for your
                  school or organization.
                </p>
                <Button
                  onClick={handleRequestDemo}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Request Demo
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                    Request Callback
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Have questions? Request a callback from our team to discuss
                  your needs.
                </p>
                <Button
                  onClick={handleRequestCallback}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs sm:text-sm touch-manipulation">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Request Callback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
