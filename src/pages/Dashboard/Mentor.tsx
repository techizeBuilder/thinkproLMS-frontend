import { MentorSidebar } from "@/components/ui/mentor-sidebar"
import { SidebarProvider } from "@/components/ui/collapsible-sidebar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react"

export default function Mentor() {
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex min-h-screen bg-background">
        <MentorSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Guide and support your students' learning journey
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Dashboard Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      My Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Active students
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Courses Taught
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Active courses
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Messages
                    </CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Unread messages
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Student Progress
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0%</div>
                    <p className="text-xs text-muted-foreground">
                      Average completion
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>
                      Latest student communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No recent messages
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>
                      Overview of student performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No student data available
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
