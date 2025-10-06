import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  PanelLeftClose, 
  PanelLeftOpen 
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

interface SidebarContextType {
  isCollapsed: boolean
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({ 
  children, 
  defaultCollapsed = false 
}: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMobile, setIsMobile] = React.useState(false)

  const toggle = React.useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  // Handle responsive behavior
  React.useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-collapse on mobile
      if (mobile && !isCollapsed) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [isCollapsed])

  // Save sidebar state to localStorage (only for desktop)
  React.useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem("sidebar-collapsed")
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved))
      }
    }
  }, [isMobile])

  React.useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
        "md:relative md:translate-x-0", // Desktop behavior
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarHeader({ 
  children, 
  className, 
  ...props 
}: SidebarHeaderProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "flex items-center border-b px-3 py-4",
        isCollapsed ? "justify-center" : "justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarContent({ 
  children, 
  className, 
  ...props 
}: SidebarContentProps) {
  return (
    <div
      className={cn("flex-1 overflow-auto py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarToggleProps extends React.ComponentProps<typeof Button> {}

export function SidebarToggle({ className, ...props }: SidebarToggleProps) {
  const { isCollapsed, toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={cn(
        "h-8 w-8 rounded-md",
        className
      )}
      {...props}
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      </span>
    </Button>
  )
}

interface SidebarTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarTitle({ 
  children, 
  className, 
  ...props 
}: SidebarTitleProps) {
  const { isCollapsed } = useSidebar()

  if (isCollapsed) return null

  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight truncate",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarNav({ children, className, ...props }: SidebarNavProps) {
  return (
    <nav
      className={cn("space-y-1 px-3", className)}
      {...props}
    >
      {children}
    </nav>
  )
}

interface SidebarNavItemProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}

export function SidebarNavItem({ 
  to, 
  icon: Icon, 
  children, 
  className 
}: SidebarNavItemProps) {
  const { isCollapsed } = useSidebar()
  const location = useLocation()
  const isActive = location.pathname === to || 
    (to !== "/" && location.pathname.startsWith(to))

  return (
    <NavLink
      to={to}
      className={({ isActive: linkActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          (isActive || linkActive) 
            ? "bg-accent text-accent-foreground" 
            : "text-muted-foreground",
          isCollapsed && "justify-center px-2",
          className
        )
      }
    >
      <Icon className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-3")} />
      {!isCollapsed && (
        <span className="truncate">{children}</span>
      )}
      {isCollapsed && (
        <span className="sr-only">{children}</span>
      )}
    </NavLink>
  )
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  label?: string
}

export function SidebarGroup({ 
  children, 
  label, 
  className, 
  ...props 
}: SidebarGroupProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className={cn("space-y-1", className)} {...props}>
      {label && !isCollapsed && (
        <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </h3>
      )}
      {children}
    </div>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarFooter({ 
  children, 
  className, 
  ...props 
}: SidebarFooterProps) {
  return (
    <div
      className={cn("border-t p-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}
