import ProfileCard from '@/components/Profile/ProfileCard';
import { School, Users, BarChart3, Settings, BookOpen } from 'lucide-react';

export default function SchoolAdminProfile() {

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your school admin account and school settings</p>
      </div>

      <ProfileCard
        title="School Admin Profile"
        description="School administrator with oversight of your school's educational programs"
      >
        {/* School Admin specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <School className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">School Administrator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Management Scope</p>
              <p className="text-sm text-muted-foreground">Oversee school mentors and students within your institution</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Analytics Access</p>
              <p className="text-sm text-muted-foreground">View comprehensive reports on student progress and mentor performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">School Settings</p>
              <p className="text-sm text-muted-foreground">Configure school-specific settings and preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Educational Oversight</p>
              <p className="text-sm text-muted-foreground">Monitor and support the educational journey of your school's students</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">School Admin Responsibilities</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Manage school mentors and their assignments</li>
              <li>• Monitor student progress and performance</li>
              <li>• Generate and review assessment reports</li>
              <li>• Oversee module completion tracking</li>
              <li>• Coordinate with lead mentors for educational initiatives</li>
            </ul>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
