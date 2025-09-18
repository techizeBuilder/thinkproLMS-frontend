import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Video, 
  Users, 
  GraduationCap,
  FolderOpen,
  Eye,
  ExternalLink,
  Download
} from 'lucide-react';
import { Resource } from '@/types/resources';
import { useNavigate } from 'react-router-dom';

// Mock data for student resources only
const mockStudentResources: Resource[] = [
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
    title: 'Science Study Guide',
    description: 'Comprehensive science study materials',
    type: 'document',
    userType: 'student',
    bucket: 'documents',
    url: 'https://example.com/science-guide.pdf',
    uploadedAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    uploadedBy: 'Lead Mentor',
    tags: ['science', 'study guide'],
    isActive: true
  },
  {
    id: '3',
    title: 'Science Experiments Demo',
    description: 'Video demonstration of science experiments',
    type: 'video',
    userType: 'student',
    bucket: 'videos',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    uploadedAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    uploadedBy: 'Lead Mentor',
    tags: ['science', 'experiments'],
    isActive: true
  },
  {
    id: '4',
    title: 'Mathematics Problem Solving',
    description: 'Step-by-step math problem solving techniques',
    type: 'video',
    userType: 'student',
    bucket: 'videos',
    url: 'https://vimeo.com/123456789',
    uploadedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    uploadedBy: 'Lead Mentor',
    tags: ['mathematics', 'problem solving'],
    isActive: true
  }
];

export default function StudentResourcesPage() {
  const navigate = useNavigate();
  const [selectedBucket, setSelectedBucket] = useState<'documents' | 'videos'>('documents');

  // Filter resources for students only
  const studentResources = mockStudentResources.filter(
    resource => resource.userType === 'student'
  );

  const documentResources = studentResources.filter(
    resource => resource.bucket === 'documents'
  );

  const videoResources = studentResources.filter(
    resource => resource.bucket === 'videos'
  );

  const handleViewResource = (resource: Resource) => {
    if (resource.type === 'video') {
      navigate(`/student/resources/${resource.id}/view`);
    } else {
      // For documents, open in new tab
      window.open(resource.url, '_blank');
    }
  };

  const handleDownloadResource = (resource: Resource) => {
    if (resource.url) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-muted-foreground">
            Access your educational materials and videos
          </p>
        </div>
      </div>

      <Tabs value={selectedBucket} onValueChange={(value: 'documents' | 'videos') => setSelectedBucket(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({documentResources.length})
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Videos ({videoResources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Study Documents</h2>
            <Badge variant="outline">{documentResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentResources.map((resource) => (
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
                        onClick={() => handleDownloadResource(resource)}
                      >
                        <Download className="h-4 w-4" />
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

        <TabsContent value="videos" className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Educational Videos</h2>
            <Badge variant="outline">{videoResources.length} resources</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoResources.map((resource) => (
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
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
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
      </Tabs>
    </div>
  );
}
