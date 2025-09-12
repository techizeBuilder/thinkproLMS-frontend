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
import { Building2, HomeIcon, Settings, Users, User, School, UserCheck, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/ui/logout-button"

interface SuperAdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SuperAdminSidebar({ className }: SuperAdminSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <Sidebar className={cn("h-screen", className)}>
      <SidebarHeader>
        <SidebarTitle>ThinkPro LMS</SidebarTitle>
        <SidebarToggle />
      </SidebarHeader>
      
      <SidebarContent className="space-y-4">
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/superadmin" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="School Management">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/schools" icon={School}>
              Schools
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/school-admins" icon={UserCheck}>
              School Admins
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/lead-mentors" icon={Crown}>
              Lead Mentors
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="User Management">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/admins" icon={Building2}>
              SuperAdmins
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/users" icon={Users}>
              All Users
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="System">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/settings" icon={Settings}>
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
