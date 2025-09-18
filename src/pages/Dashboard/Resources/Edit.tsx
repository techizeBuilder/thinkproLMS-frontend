import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Upload, 
  Link, 
  FileText, 
  Video,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import type { UpdateResourceData, Resource, ResourceType, UserType } from '@/types/resources';

// Mock resource data - in real app, this would come from API
const mockResource: Resource = {
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
};

export default function EditResourcePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<UpdateResourceData>({
    id: id || '',
    title: '',
    description: '',
    type: 'document',
    userType: 'student',
    url: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Simulate loading resource data
    const loadResource = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setFormData({
          id: mockResource.id,
          title: mockResource.title,
          description: mockResource.description,
          type: mockResource.type,
          userType: mockResource.userType,
          url: mockResource.url,
          tags: mockResource.tags
        });
      } catch (error) {
        console.error('Error loading resource:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadResource();
    }
  }, [id]);

  const handleInputChange = (field: keyof UpdateResourceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement actual API call
      console.log('Updating resource:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to resources page
      navigate('/leadmentor/resources');
    } catch (error) {
      console.error('Error updating resource:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        // TODO: Implement actual API call
        console.log('Deleting resource:', id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to resources page
        navigate('/leadmentor/resources');
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/leadmentor/resources')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Resource</h1>
            <p className="text-muted-foreground">
              Update resource information and content
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Information</CardTitle>
            <CardDescription>
              Update basic information about the resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter resource title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userType">Target Audience *</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: UserType) => handleInputChange('userType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="mentor">Mentors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the resource content and purpose"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Resource Type *</Label>
              <Tabs value={formData.type} onValueChange={(value: string) => handleInputChange('type', value as ResourceType)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="document" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document
                  </TabsTrigger>
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Content</CardTitle>
            <CardDescription>
              Update the resource file or URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={formData.url ? 'url' : 'file'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload New File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    accept={
                      formData.type === 'video' 
                        ? 'video/mp4,video/avi,video/mov' 
                        : '.pdf,.pptx,.xlsx,.docx'
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.type === 'video' 
                      ? 'Supported formats: MP4, AVI, MOV' 
                      : 'Supported formats: PDF, PPTX, XLSX, DOCX'
                    }
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Resource URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder={
                      formData.type === 'video' 
                        ? 'https://youtube.com/watch?v=... or https://vimeo.com/...' 
                        : 'https://example.com/document.pdf'
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.type === 'video' 
                      ? 'YouTube, Vimeo, or direct video links' 
                      : 'Direct links to documents or external resources'
                    }
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Update tags to help categorize and search for this resource
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/leadmentor/resources')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Resource'}
          </Button>
        </div>
      </form>
    </div>
  );
}
