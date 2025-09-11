import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Building2, HomeIcon, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SuperAdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SuperAdminSidebar({ className }: SuperAdminSidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Super Admin Dashboard
          </h2>
          <div className="space-y-1">
            <NavLink to="/superadmin">
              <Button variant="secondary" className="w-full justify-start">
                <HomeIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </NavLink>
            <NavLink to="/superadmin/admins">
              <Button variant="ghost" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Admins
              </Button>
            </NavLink>
            <NavLink to="/superadmin/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                All Users
              </Button>
            </NavLink>
            <NavLink to="/superadmin/settings">
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
