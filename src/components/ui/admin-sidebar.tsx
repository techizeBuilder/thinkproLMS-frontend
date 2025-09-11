import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, HomeIcon, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: AdminSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Admin Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink to="/admin">
              <Button variant="secondary" className="w-full justify-start">
                <HomeIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </NavLink>
            <NavLink to="/admin/courses">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Courses
              </Button>
            </NavLink>
            <NavLink to="/admin/students">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Students
              </Button>
            </NavLink>
            <NavLink to="/admin/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
