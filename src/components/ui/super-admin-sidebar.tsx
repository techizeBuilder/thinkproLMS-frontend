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
import { Building2, HomeIcon, Settings, Users, User, School, UserCheck, Crown, BookOpen, FileText, Layers, Award, Calendar, BarChart3 } from "lucide-react"
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
            <SidebarNavItem to="/superadmin/mentors" icon={Users}>
              School Mentors
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/students" icon={Users}>
              Students
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="User Management">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/admins" icon={Building2}>
              SuperAdmins
            </SidebarNavItem>
            {/* <SidebarNavItem to="/superadmin/users" icon={Users}>
              All Users
            </SidebarNavItem> */}
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Assessment">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/question-bank" icon={BookOpen}>
              Question Bank
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/certificates" icon={Award}>
              Certificates
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/session-progress" icon={BarChart3}>
              Session Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Curriculum">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/modules" icon={Layers}>
              Modules
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/sessions" icon={Calendar}>
              Sessions
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Resources">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/resources" icon={FileText}>
              Resources
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/superadmin/profile" icon={User}>
              Profile
            </SidebarNavItem>
            <SidebarNavItem to="/superadmin/settings" icon={Settings}>
              Settings
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-1">
          {!isCollapsed ? (
            <LogoutButton 
              variant="ghost" 
              className="w-full justify-start text-sm" 
              isCollapsed={false}
            />
          ) : (
            <LogoutButton 
              variant="ghost" 
              size="icon" 
              className="w-full" 
              isCollapsed={true}
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
