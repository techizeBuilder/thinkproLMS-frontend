import ProfileCard from '@/components/Profile/ProfileCard';
import { GraduationCap, Users, BookOpen, FileText, BarChart3, Award } from 'lucide-react';

export default function MentorProfile() {

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your mentor account and teaching responsibilities</p>
      </div>

      <ProfileCard
        title="Mentor Profile"
        description="Educational mentor with direct student engagement and teaching responsibilities"
      >
        {/* Mentor specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">School Mentor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Student Management</p>
              <p className="text-sm text-muted-foreground">Guide and support assigned students in their learning journey</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Educational Resources</p>
              <p className="text-sm text-muted-foreground">Access and share educational materials with students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Assessment Creation</p>
              <p className="text-sm text-muted-foreground">Create and manage assessments to evaluate student progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Progress Tracking</p>
              <p className="text-sm text-muted-foreground">Monitor student progress and module completion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Question Bank</p>
              <p className="text-sm text-muted-foreground">Access and contribute to the educational question database</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Mentor Responsibilities</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Provide direct guidance to assigned students</li>
              <li>• Create and administer assessments</li>
              <li>• Track and report student progress</li>
              <li>• Share educational resources and materials</li>
              <li>• Collaborate with school admin on student development</li>
            </ul>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
