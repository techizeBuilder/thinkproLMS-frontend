import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp,
  Download,
  Filter,
  Calendar
} from "lucide-react";
import ModuleCompletionReport from "./ModuleCompletionReport";
import SummaryReport from "./SummaryReport";
import AssessmentCompletionReport from "./AssessmentCompletionReport";
import StudentActivityReport from "./StudentActivityReport";
import GraphicalReports from "./GraphicalReports";

export default function MentorReportsPage() {
  const [activeTab, setActiveTab] = useState("summary");

  const reportTabs = [
    {
      id: "summary",
      label: "Summary Report",
      description: "Overview of all grades, subjects, classes, and modules",
      icon: <BarChart3 className="h-4 w-4" />,
      component: <SummaryReport />
    },
    {
      id: "module-completion",
      label: "Module Completion",
      description: "Module completion and pending status by grade, subject, class",
      icon: <BookOpen className="h-4 w-4" />,
      component: <ModuleCompletionReport />
    },
    {
      id: "assessment-completion",
      label: "Assessment Completion",
      description: "Assessment completion reports by grade, subject, class, module",
      icon: <FileText className="h-4 w-4" />,
      component: <AssessmentCompletionReport />
    },
    {
      id: "student-activity",
      label: "Student Activity",
      description: "Student access to videos, content, assessments with time tracking",
      icon: <Users className="h-4 w-4" />,
      component: <StudentActivityReport />
    },
    {
      id: "graphical",
      label: "Graphical Reports",
      description: "Visual charts and analytics for better insights",
      icon: <TrendingUp className="h-4 w-4" />,
      component: <GraphicalReports />
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive reports for monitoring student progress and engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Taken</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {reportTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {tab.component}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
