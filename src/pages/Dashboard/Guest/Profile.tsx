import { useAuth } from '@/contexts/AuthContext';
import ProfileCard from '@/components/Profile/ProfileCard';
import { Badge } from '@/components/ui/badge';
import { Eye, BookOpen, Star, Users, Heart, Gift } from 'lucide-react';

export default function GuestProfile() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Your guest account and learning preferences</p>
      </div>

      <ProfileCard
        title="Guest Profile"
        description="Explore educational content and discover our learning platform"
      >
        {/* Guest specific information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground">Guest User</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Learning Access</p>
              <p className="text-sm text-muted-foreground">Browse educational resources and sample content</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Premium Features</p>
              <p className="text-sm text-muted-foreground">Discover premium learning opportunities</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Community</p>
              <p className="text-sm text-muted-foreground">Connect with other learners and educators</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Learning Journey</p>
              <p className="text-sm text-muted-foreground">Begin your educational exploration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Gift className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Special Access</p>
              <p className="text-sm text-muted-foreground">Enjoy guest-exclusive content and features</p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Guest Experience</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Explore educational resources and materials</li>
              <li>• Try sample quizzes and assessments</li>
              <li>• Attend virtual classes and workshops</li>
              <li>• Discover premium learning opportunities</li>
              <li>• Connect with the learning community</li>
              <li>• Upgrade to full access when ready</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Ready to Learn More?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Upgrade to a full account to access all features, track your progress, and join our complete learning community.
            </p>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Upgrade Available
            </Badge>
          </div>
        </div>
      </ProfileCard>
    </div>
  );
}
