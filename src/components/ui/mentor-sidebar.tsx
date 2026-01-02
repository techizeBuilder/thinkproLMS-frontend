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
import { BookOpen, HomeIcon, User, Users, MessageSquare, FolderOpen, ClipboardList, Database, Bell } from "lucide-react"
import { LogoutButton } from "@/components/ui/logout-button"
import { Badge } from "@/components/ui/badge"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"
import { useNotifications } from "@/contexts/NotificationContext"
import { Link } from "react-router-dom"
import { Button } from "./button"


interface MentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MentorSidebar({ className }: MentorSidebarProps) {
  const { isCollapsed } = useSidebar()
  const unreadCount = useUnreadMessageCount()
  const { counts } = useNotifications()

  return (
    <Sidebar className={cn("", className)}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <img
            src="/fancy-logo.jpg"
            alt="ThinkPro Logo"
            className="h-8 w-8 object-contain"
          />
          <SidebarTitle>School Mentor Portal</SidebarTitle>
        </div>
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

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/mentor/messages" icon={MessageSquare}>
              <div className="flex items-center justify-between w-full">
                <span>Messages</span>
                {unreadCount > 0 && !isCollapsed && (
                  <Badge
                    variant="default"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/notifications" icon={Bell}>
              <div className="flex items-center justify-between w-full">
                <span>Notifications</span>
                {counts.unreadNotifications > 0 && !isCollapsed && (
                  <Badge
                    variant="default"
                    className="ml-auto text-xs px-1.5 py-0 h-5"
                  >
                    {counts.unreadNotifications}
                  </Badge>
                )}
              </div>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Teaching">
          <SidebarNav>
            <SidebarNavItem to="/mentor/resources" icon={FolderOpen}>
              Resources
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/students" icon={Users}>
              My Students
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/assessments" icon={ClipboardList}>
              Assessments
            </SidebarNavItem>
            <SidebarNavItem to="/mentor/question-bank" icon={Database}>
              Question Bank
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Curriculum">
          <SidebarNav>
            <SidebarNavItem to="/mentor/session-progress" icon={BookOpen}>
              Session Progress
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="Account">
          <SidebarNav>
            <SidebarNavItem to="/mentor/profile" icon={User}>
              Profile
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>
      </SidebarContent>

      
           <SidebarFooter>
                <div className="flex flex-col gap-1">
                  {!isCollapsed ? (
                    <>
                      {/* Enter HRMS */}
                      <Link to="/hrms/mentor">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm bg-[#4b5563] hover:bg-[#374151]"
                        >
                          <Users className="mr-3 h-4 w-4 text-white" />
                          <span className="text-white">Enter HRMS</span>
                        </Button>
                      </Link>
        
                      <LogoutButton
                        variant="ghost"
                        className="w-full justify-start text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover-bg)]"
                        isCollapsed={false}
                      />
                    </>
                  ) : (
                    <>
                      <Link to="/hrms/admin">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-full bg-[#4b5563] hover:bg-[#374151]"
                        >
                          <Users className="h-4 w-4 text-white" />
                          <span className="sr-only">Enter HRMS</span>
                        </Button>
                      </Link>
        
                      <LogoutButton
                        variant="ghost"
                        size="icon"
                        className="w-full justify-start text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-hover-bg)]"
                        isCollapsed={true}
                      />
                    </>
                  )}
                </div>
              </SidebarFooter>
      
    </Sidebar>
  );
}
