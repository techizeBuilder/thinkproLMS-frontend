import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileCardProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ProfileCard({ children, title, description }: ProfileCardProps) {
  const { user } = useAuth();

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      superadmin: 'Super Admin',
      leadmentor: 'Lead Mentor',
      schooladmin: 'School Admin',
      mentor: 'Mentor',
      student: 'Student',
      guest: 'Guest'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      superadmin: 'bg-red-100 text-red-800 border-red-200',
      leadmentor: 'bg-blue-100 text-blue-800 border-blue-200',
      schooladmin: 'bg-green-100 text-green-800 border-green-200',
      mentor: 'bg-purple-100 text-purple-800 border-purple-200',
      student: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      guest: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {title || 'Profile Information'}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Role</p>
              <Badge className={getRoleBadgeColor(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Name */}
        {user.name && (
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
          </div>
        )}

        {/* Role-specific content */}
        {children}
      </CardContent>
    </Card>
  );
}
