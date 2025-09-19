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
  Trash2,
  Loader2
} from 'lucide-react';
import type { UserType } from '@/types/resources';
import type { Resource as ApiResource, UpdateResourceData } from '@/api/resourceService';
import { resourceService } from '@/api/resourceService';
import { subjectService } from '@/api/subjectService';
import { schoolService } from '@/api/schoolService';
import type { Subject } from '@/api/subjectService';
import type { School } from '@/api/schoolService';
import { toast } from 'sonner';

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
];

export default function EditResourcePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<UpdateResourceData>({
    title: '',
    description: '',
    type: 'document',
    category: 'student',
    url: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [resource, setResource] = useState<ApiResource | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Load resource data and form data in parallel
        const [resourceResponse, subjectsData, schoolsResponse] = await Promise.all([
          resourceService.getById(id),
          subjectService.getAllSubjects(),
          schoolService.getAll(),
        ]);

        const resourceData = resourceResponse.data;
        setResource(resourceData);
        setSubjects(subjectsData);
        setSchools(schoolsResponse.data);

        // Set form data from the resource
        setFormData({
          title: resourceData.title,
          description: resourceData.description,
          type: resourceData.type,
          category: resourceData.category,
          subject: resourceData.subject?._id,
          grade: resourceData.grade,
          school: resourceData.school?._id,
          url: resourceData.content.url,
          tags: resourceData.tags,
          isPublic: resourceData.isPublic,
        });

        // Set active tab based on whether the resource is external
        setActiveTab(resourceData.content.isExternal ? 'url' : 'file');
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load resource data');
        navigate('/leadmentor/resources');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

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
    if (!id) return;
    
    setIsUpdating(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.type || !formData.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (activeTab === 'file' && !formData.file && !resource?.content.isExternal) {
        toast.error('Please select a file to upload');
        return;
      }

      if (activeTab === 'url' && !formData.url) {
        toast.error('Please provide an external URL');
        return;
      }

      // Update the resource
      await resourceService.update(id, formData);
      
      toast.success('Resource updated successfully!');
      navigate('/leadmentor/resources');
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        await resourceService.delete(id);
        toast.success('Resource deleted successfully!');
        navigate('/leadmentor/resources');
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource. Please try again.');
      }
    }
  };

  const handleTabChange = (tab: 'file' | 'url') => {
    setActiveTab(tab);
    if (tab === 'file') {
      setFormData(prev => ({ ...prev, url: '' }));
    } else {
      setFormData(prev => ({ ...prev, file: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading resource...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="text-muted-foreground mb-4">The resource you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/leadmentor/resources')}>
            Back to Resources
          </Button>
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
                <Label htmlFor="category">Target Audience *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: UserType) => handleInputChange('category', value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject || ''}
                  onValueChange={(value) => handleInputChange('subject', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={formData.grade || ''}
                  onValueChange={(value) => handleInputChange('grade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Select
                value={formData.school || ''}
                onValueChange={(value) => handleInputChange('school', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school._id} value={school._id}>
                      {school.name} - {school.city}, {school.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resource Type *</Label>
              <Tabs value={formData.type} onValueChange={(value: string) => handleInputChange('type', value)}>
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
            <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'file' | 'url')} className="w-full">
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
                        ? 'video/mp4,video/avi,video/mov,video/wmv,video/webm' 
                        : '.pdf,.pptx,.xlsx,.docx,.doc,.xls,.ppt'
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.type === 'video' 
                      ? 'Supported formats: MP4, AVI, MOV, WMV, WEBM' 
                      : 'Supported formats: PDF, PPTX, XLSX, DOCX, DOC, XLS, PPT'
                    }
                  </p>
                  {resource?.content.fileName && (
                    <p className="text-sm text-blue-600">
                      Current file: {resource.content.fileName}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">External URL</Label>
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

        <Card>
          <CardHeader>
            <CardTitle>Access Settings</CardTitle>
            <CardDescription>
              Configure who can access this resource
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic || false}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPublic">Make this resource public</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Resource
          </Button>
          <div className="flex gap-4">
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
        </div>
      </form>
    </div>
  );
}
