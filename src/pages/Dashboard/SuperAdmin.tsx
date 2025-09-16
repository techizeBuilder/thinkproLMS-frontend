import { Outlet, useLocation } from "react-router-dom";
import { SuperAdminSidebar } from "@/components/ui/super-admin-sidebar";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, BookOpen, DollarSign } from "lucide-react";

export default function SuperAdmin() {
  const location = useLocation();

  // Show dashboard stats only on main routes, not nested routes like /create, /edit
  const showDashboardStats =
    location.pathname === "/superadmin" ||
    location.pathname === "/superadmin/admins";

  return (
    <SidebarProvider defaultCollapsed={false}>
      <div className="flex min-h-screen bg-background">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your entire system from here
              </p>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Dashboard Stats - Only show on main routes */}
              {/* {showDashboardStats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        +0% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total SuperAdmins
                      </CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1</div>
                      <p className="text-xs text-muted-foreground">
                        System administrators
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Courses
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Courses running
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$0</div>
                      <p className="text-xs text-muted-foreground">
                        +0% from last month
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )} */}

              {/* Outlet for nested routes */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
