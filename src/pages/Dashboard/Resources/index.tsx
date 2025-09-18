import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Video, 
  Plus, 
  Users, 
  GraduationCap,
  FolderOpen,
  Eye,
} from 'lucide-react';
import type { Resource, UserType, BucketType } from '@/types/resources';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Mathematics Fundamentals',
    description: 'Basic mathematics concepts for students',
    type: 'document',
    userType: 'student',
    bucket: 'documents',
    url: 'https://example.com/math-fundamentals.pdf',
    uploadedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    uploadedBy: 'Lead Mentor',
    tags: ['mathematics', 'fundamentals'],
    isActive: true
  },
  {
    id: '2',
    title: 'Advanced Teaching Methods',
    description: 'Advanced teaching techniques for mentors',
    type: 'document',
    userType: 'mentor',
    bucket: 'documents',
    url: 'https://example.com/teaching-methods.pdf',
    uploadedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    uploadedBy: 'Lead Mentor',
    tags: ['teaching', 'methods'],
    isActive: true
  },
  {
    id: '3',
    title: 'Science Experiments Demo',
    description: 'Video demonstration of science experiments',
    type: 'video',
    userType: 'student',
    bucket: 'videos',
    url: 'https://youtube.com/watch?v=example',
    uploadedAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    uploadedBy: 'Lead Mentor',
    tags: ['science', 'experiments'],
    isActive: true
  },
  {
    id: '4',
    title: 'Mentor Training Session',
    description: 'Training video for new mentors',
    type: 'video',
    userType: 'mentor',
    bucket: 'videos',
    url: 'https://vimeo.com/example',
    uploadedAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    uploadedBy: 'Lead Mentor',
    tags: ['training', 'mentors'],
    isActive: true
  }
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<UserType>('student');
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('documents');

  // Filter resources based on user type and bucket
  const filteredResources = mockResources.filter(
    resource => resource.userType === selectedUserType && resource.bucket === selectedBucket
  );

  // Check if user can see mentor resources
  const canViewMentorResources = user?.role === 'leadmentor' || user?.role === 'mentor';

  const handleAddResource = () => {
    navigate(`/leadmentor/resources/add?userType=${selectedUserType}&bucket=${selectedBucket}`);
  };

  const handleEditResource = (resourceId: string) => {
    navigate(`/leadmentor/resources/${resourceId}/edit`);
  };

  const handleViewResource = (resource: Resource) => {
    if (resource.type === 'video') {
      navigate(`/leadmentor/resources/${resource.id}/view`);
    } else {
      // For documents, open in new tab or iframe
      window.open(resource.url, '_blank');
    }
  };

  const getResourceIcon = (type: string) => {
    return type === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const getFileTypeBadge = (url?: string) => {
    if (!url) return null;
    
    const extension = url.split('.').pop()?.toLowerCase();
    const isLink = url.startsWith('http');
    
    if (isLink) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return <Badge variant="secondary">YouTube</Badge>;
      } else if (url.includes('vimeo.com')) {
        return <Badge variant="secondary">Vimeo</Badge>;
      } else {
        return <Badge variant="secondary">Link</Badge>;
      }
    }
    
    return <Badge variant="outline">{extension?.toUpperCase()}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources Management</h1>
          <p className="text-muted-foreground">
            Manage educational resources for mentors and students
          </p>
        </div>
        <Button onClick={handleAddResource} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Resource
        </Button>
      </div>

      <Tabs value={`${selectedUserType}-${selectedBucket}`} onValueChange={(value) => {
        const [userType, bucket] = value.split('-') as [UserType, BucketType];
        setSelectedUserType(userType);
        setSelectedBucket(bucket);
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="student-documents" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Student Documents
          </TabsTrigger>
          <TabsTrigger value="student-videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Student Videos
          </TabsTrigger>
          {canViewMentorResources && (
            <>
              <TabsTrigger value="mentor-documents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mentor Documents
              </TabsTrigger>
              <TabsTrigger value="mentor-videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Mentor Videos
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="student-documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Student Documents</h2>
              <Badge variant="outline">{filteredResources.length} resources</Badge>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource.url)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResource(resource.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy} • {resource.uploadedAt.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="student-videos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Student Videos</h2>
              <Badge variant="outline">{filteredResources.length} resources</Badge>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </div>
                    {getFileTypeBadge(resource.url)}
                  </div>
                  {resource.description && (
                    <CardDescription>{resource.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditResource(resource.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Uploaded by {resource.uploadedBy} • {resource.uploadedAt.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {canViewMentorResources && (
          <>
            <TabsContent value="mentor-documents" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Mentor Documents</h2>
                  <Badge variant="outline">{filteredResources.length} resources</Badge>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.type)}
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        {getFileTypeBadge(resource.url)}
                      </div>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResource(resource)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResource(resource.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Uploaded by {resource.uploadedBy} • {resource.uploadedAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mentor-videos" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Mentor Videos</h2>
                  <Badge variant="outline">{filteredResources.length} resources</Badge>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(resource.type)}
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        {getFileTypeBadge(resource.url)}
                      </div>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResource(resource)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResource(resource.id)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Uploaded by {resource.uploadedBy} • {resource.uploadedAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
