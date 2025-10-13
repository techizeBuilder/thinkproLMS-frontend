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
import { BookOpen, HomeIcon, User, Users, MessageSquare, FolderOpen, ClipboardList, Database } from "lucide-react"
import { LogoutButton } from "@/components/ui/logout-button"
import { Badge } from "@/components/ui/badge"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"

interface MentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MentorSidebar({ className }: MentorSidebarProps) {
  const { isCollapsed } = useSidebar()
  const unreadCount = useUnreadMessageCount()

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

        <SidebarGroup label="Communication">
          <SidebarNav>
            <SidebarNavItem to="/mentor/messages" icon={MessageSquare}>
              <div className="flex items-center justify-between w-full">
                <span>Messages</span>
                {unreadCount > 0 && !isCollapsed && (
                  <Badge variant="default" className="ml-auto text-xs px-1.5 py-0 h-5">
                    {unreadCount}
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
