import { useAuth } from '@/contexts/AuthContext';
import ProfileCard from '@/components/Profile/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, BookOpen, FileText, GraduationCap } from 'lucide-react';

export default function LeadMentorProfile() {
  const { user } = useAuth();

  const getPermissionDisplayName = (permission: string) => {
    const permissionMap: { [key: string]: string } = {
      add_resources: 'Add Resources',
      add_modules: 'Add Modules',
      add_students: 'Add Students',
      add_admins: 'Add Admins',
      add_mentors: 'Add Mentors'
    };
    return permissionMap[permission] || permission;
  };

  const getPermissionBadgeColor = (permission: string) => {
    const colorMap: { [key: string]: string } = {
      add_resources: 'bg-blue-100 text-blue-800 border-blue-200',
      add_modules: 'bg-green-100 text-green-800 border-green-200',
      add_students: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      add_admins: 'bg-purple-100 text-purple-800 border-purple-200',
      add_mentors: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colorMap[permission] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your lead mentor account and permissions</p>
      </div>

      <ProfileCard
        title="Lead Mentor Profile"
        description="Educational leader with assigned permissions for system management"
      >
        {/* Lead Mentor specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">Lead Mentor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Assigned Permissions</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((permission) => (
                    <Badge 
                      key={permission} 
                      className={getPermissionBadgeColor(permission)}
                    >
                      {getPermissionDisplayName(permission)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">No specific permissions assigned</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Educational Focus</p>
              <p className="text-sm text-muted-foreground">Lead educational initiatives and mentor management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Content Management</p>
              <p className="text-sm text-muted-foreground">Create and manage educational resources and modules</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Mentor Leadership</p>
              <p className="text-sm text-muted-foreground">Guide and support school mentors in their educational delivery</p>
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
