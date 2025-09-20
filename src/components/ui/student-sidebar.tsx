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
import { BookOpen, HomeIcon, Settings, User, Award, Clock, FileText, FolderOpen, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/ui/logout-button"

interface StudentSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function StudentSidebar({ className }: StudentSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <SidebarTitle>Student Portal</SidebarTitle>
        <SidebarToggle />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/student" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Learning">
          <SidebarNav>
            <SidebarNavItem to="/student/courses" icon={BookOpen}>
              My Courses
            </SidebarNavItem>
            <SidebarNavItem to="/student/resources" icon={FolderOpen}>
              Resources
            </SidebarNavItem>
            <SidebarNavItem to="/student/assessments" icon={ClipboardList}>
              Assessments
            </SidebarNavItem>
            <SidebarNavItem to="/student/progress" icon={Clock}>
              Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Achievements">
          <SidebarNav>
            <SidebarNavItem to="/student/achievements" icon={Award}>
              Achievements
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/student/profile" icon={User}>
              Profile
            </SidebarNavItem>
            <SidebarNavItem to="/student/settings" icon={Settings}>
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
