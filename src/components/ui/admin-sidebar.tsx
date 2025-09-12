import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarNav,
  SidebarNavItem,
  SidebarTitle,
  SidebarToggle,
  SidebarGroup,
  SidebarFooter,
  useSidebar
} from "@/components/ui/collapsible-sidebar"
import { BookOpen, HomeIcon, Settings, Users, User, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/ui/logout-button"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <SidebarTitle>Admin Panel</SidebarTitle>
        <SidebarToggle />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/admin" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Content">
          <SidebarNav>
            <SidebarNavItem to="/admin/courses" icon={BookOpen}>
              Courses
            </SidebarNavItem>
            <SidebarNavItem to="/admin/students" icon={GraduationCap}>
              Students
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Management">
          <SidebarNav>
            <SidebarNavItem to="/admin/users" icon={Users}>
              Users
            </SidebarNavItem>
            <SidebarNavItem to="/admin/settings" icon={Settings}>
              Settings
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-1">
          {!isCollapsed ? (
            <>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <User className="mr-3 h-4 w-4" />
                Profile
              </Button>
              <LogoutButton 
                variant="ghost" 
                className="w-full justify-start text-sm" 
                isCollapsed={false}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="w-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Button>
              <LogoutButton 
                variant="ghost" 
                size="icon" 
                className="w-full" 
                isCollapsed={true}
              />
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
