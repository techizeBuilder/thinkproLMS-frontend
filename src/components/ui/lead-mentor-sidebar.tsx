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
import { HomeIcon, Settings, LogOut, User, UserCheck, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeadMentorSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LeadMentorSidebar({ className }: LeadMentorSidebarProps) {
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
            <SidebarNavItem to="/leadmentor" icon={HomeIcon}>
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="School Management">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/school-admins" icon={UserCheck}>
              School Admins
            </SidebarNavItem>
            <SidebarNavItem to="/leadmentor/lead-mentors" icon={Crown}>
              Lead Mentors
            </SidebarNavItem>
          </SidebarNav>
        </SidebarGroup>

        <SidebarGroup label="System">
          <SidebarNav>
            <SidebarNavItem to="/leadmentor/settings" icon={Settings}>
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
              <Button variant="ghost" className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="w-full">
                <User className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Button>
              <Button variant="ghost" size="icon" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
