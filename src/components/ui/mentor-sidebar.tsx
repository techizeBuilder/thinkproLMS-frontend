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
import { BookOpen, HomeIcon, Settings, User, Users, MessageSquare, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/ui/logout-button"

interface MentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MentorSidebar({ className }: MentorSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <SidebarTitle>Mentor Portal</SidebarTitle>
        <SidebarToggle />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup label="Dashboard">
          <SidebarNav>
            <SidebarNavItem to="/mentor" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Teaching">
          <SidebarNav>
            <SidebarNavItem to="/mentor/courses" icon={BookOpen}>
              My Courses
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/students" icon={Users}>
              My Students
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/assignments" icon={FileText}>
              Assignments
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/mentor/messages" icon={MessageSquare}>
              Messages
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Analytics">
          <SidebarNav>
            <SidebarNavItem to="/mentor/analytics" icon={BarChart3}>
              Student Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/mentor/profile" icon={User}>
              Profile
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/settings" icon={Settings}>
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
