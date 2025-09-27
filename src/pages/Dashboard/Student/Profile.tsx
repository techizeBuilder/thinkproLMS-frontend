import ProfileCard from '@/components/Profile/ProfileCard';
import { BookOpen, Award, FileText, BarChart3, Users, Target } from 'lucide-react';

export default function StudentProfile() {

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">View your student account and academic progress</p>
      </div>

      <ProfileCard
        title="Student Profile"
        description="Your personal learning dashboard and academic information"
      >
        {/* Student specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">Student</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Learning Focus</p>
              <p className="text-sm text-muted-foreground">Engage with educational content and assessments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Educational Resources</p>
              <p className="text-sm text-muted-foreground">Access learning materials and study resources</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Progress Tracking</p>
              <p className="text-sm text-muted-foreground">Monitor your learning progress and module completion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Assessments</p>
              <p className="text-sm text-muted-foreground">Take assessments and view your results</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Mentor Support</p>
              <p className="text-sm text-muted-foreground">Receive guidance from your assigned mentor</p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Student Learning Journey</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Access educational resources and materials</li>
              <li>• Complete learning modules at your own pace</li>
              <li>• Take assessments to test your knowledge</li>
              <li>• Track your progress and achievements</li>
              <li>• Receive support from your mentor</li>
              <li>• Earn certificates for completed courses</li>
            </ul>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
