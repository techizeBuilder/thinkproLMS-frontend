import ProfileCard from '@/components/Profile/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { Crown, Settings, Database, Users, School } from 'lucide-react';

export default function SuperAdminProfile() {

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your super admin account and system settings</p>
      </div>

      <ProfileCard
        title="Super Admin Profile"
        description="System administrator with full access to all features and settings"
      >
        {/* Super Admin specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">System Administrator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Permissions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="secondary">Full System Access</Badge>
                <Badge variant="secondary">User Management</Badge>
                <Badge variant="secondary">System Configuration</Badge>
                <Badge variant="secondary">Data Management</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">System Access</p>
              <p className="text-sm text-muted-foreground">Complete administrative control over the LMS platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Management Scope</p>
              <p className="text-sm text-muted-foreground">All users, schools, mentors, and system resources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <School className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">School Management</p>
              <p className="text-sm text-muted-foreground">Create and manage all schools in the system</p>
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
