import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Video,
  BookOpen,
  Star,
  Plus,
} from "lucide-react";

export default function GuestClasses() {
  const upcomingClasses = [
    {
      id: 1,
      title: "ThinkPro LMS Platform Demo",
      description:
        "Comprehensive demonstration of our learning management system features and capabilities.",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "45 minutes",
      instructor: "Sarah Johnson",
      maxParticipants: 50,
      currentParticipants: 23,
      type: "Demo",
      level: "Beginner",
    },
    {
      id: 2,
      title: "Digital Learning Best Practices",
      description:
        "Learn about effective strategies for implementing digital learning in educational institutions.",
      date: "2024-01-18",
      time: "2:00 PM",
      duration: "60 minutes",
      instructor: "Michael Chen",
      maxParticipants: 30,
      currentParticipants: 18,
      type: "Workshop",
      level: "Intermediate",
    },
    {
      id: 3,
      title: "Student Engagement Techniques",
      description:
        "Discover innovative methods to keep students engaged in online learning environments.",
      date: "2024-01-22",
      time: "11:00 AM",
      duration: "30 minutes",
      instructor: "Emily Rodriguez",
      maxParticipants: 100,
      currentParticipants: 67,
      type: "Webinar",
      level: "All Levels",
    },
    {
      id: 4,
      title: "Platform Customization Guide",
      description:
        "Learn how to customize ThinkPro LMS to match your school's unique requirements.",
      date: "2024-01-25",
      time: "3:00 PM",
      duration: "90 minutes",
      instructor: "David Kim",
      maxParticipants: 25,
      currentParticipants: 12,
      type: "Training",
      level: "Advanced",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Demo":
        return "bg-blue-100 text-blue-800";
      case "Workshop":
        return "bg-green-100 text-green-800";
      case "Webinar":
        return "bg-purple-100 text-purple-800";
      case "Training":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      case "All Levels":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRegister = (classId: number) => {
    // TODO: Implement class registration functionality
    alert(
      `Class registration functionality for class ${classId} will be implemented soon!`
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="px-3 py-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Online Classes & Demonstrations
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Register for our free online classes, workshops, and demonstrations to
          learn more about ThinkPro LMS.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">4</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Upcoming Classes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">120</p>
                <p className="text-sm text-gray-600">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">56</p>
                <p className="text-sm text-gray-600">Hours of Content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {upcomingClasses.map((classItem) => (
          <Card
            key={classItem.id}
            className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    {classItem.title}
                  </CardTitle>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {classItem.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge className={getTypeColor(classItem.type)}>
                    {classItem.type}
                  </Badge>
                  <Badge className={getLevelColor(classItem.level)}>
                    {classItem.level}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Class Details */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(classItem.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{classItem.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Video className="h-4 w-4" />
                    <span>{classItem.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{classItem.instructor}</span>
                  </div>
                </div>

                {/* Participants Info */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {classItem.currentParticipants} /{" "}
                      {classItem.maxParticipants} participants
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                {/* Registration Button */}
                <Button
                  onClick={() => handleRegister(classItem.id)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm sm:text-base h-9 sm:h-10 md:h-11 touch-manipulation"
                  disabled={
                    classItem.currentParticipants >= classItem.maxParticipants
                  }>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  {classItem.currentParticipants >= classItem.maxParticipants
                    ? "Class Full"
                    : "Register for Class"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Custom Demo */}
      <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Need a Custom Demonstration?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find a suitable time? Request a personalized demonstration
              tailored to your specific needs and schedule.
            </p>
            <Button
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
              onClick={() =>
                alert(
                  "Custom demo request functionality will be implemented soon!"
                )
              }>
              <Calendar className="h-4 w-4 mr-2" />
              Request Custom Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
