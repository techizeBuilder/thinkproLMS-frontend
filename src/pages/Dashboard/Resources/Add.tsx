import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import { CreateResourceData, ResourceType, UserType, BucketType } from '@/types/resources';

export default function AddResourcePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState<CreateResourceData>({
    title: '',
    description: '',
    type: 'document',
    userType: (searchParams.get('userType') as UserType) || 'student',
    url: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof CreateResourceData, value: any) => {
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
    setIsUploading(true);

    try {
      // TODO: Implement actual API call
      console.log('Creating resource:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to resources page
      navigate('/leadmentor/resources');
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getBucketType = (): BucketType => {
    return formData.type === 'video' ? 'videos' : 'documents';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leadmentor/resources')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Resource</h1>
          <p className="text-muted-foreground">
            Create a new educational resource for {formData.userType}s
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Information</CardTitle>
            <CardDescription>
              Provide basic information about the resource
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
              <Tabs value={formData.type} onValueChange={(value: ResourceType) => handleInputChange('type', value)}>
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
              Upload a file or provide a URL link
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
                  <Label htmlFor="file">Upload File</Label>
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
              Add tags to help categorize and search for this resource
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
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Creating...' : 'Create Resource'}
          </Button>
        </div>
      </form>
    </div>
  );
}
