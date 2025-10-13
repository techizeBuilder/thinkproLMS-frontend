import { AdminSidebar } from "@/components/ui/admin-sidebar"
import { SidebarProvider } from "@/components/ui/collapsible-sidebar"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { BookOpen, GraduationCap, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

export default function Admin() {
  const { user } = useAuth();
  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">{user?.name || "User"}</h1>
              <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">Admin</Badge>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Dashboard Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      My Courses
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Courses created
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Students
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled students
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Course Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">
                      Total earnings
                    </p>
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
