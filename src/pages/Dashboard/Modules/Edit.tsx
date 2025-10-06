import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { moduleService } from '@/api/moduleService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EditModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Check if user has permission to manage modules
  const hasPermission = user?.role === 'superadmin' || user?.permissions?.includes('add_modules');

  useEffect(() => {
    if (id) {
      fetchModule();
    }
  }, [id]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      const module = await moduleService.getModuleById(id!);
      setFormData({
        name: module.name,
        description: module.description || '',
      });
    } catch (error) {
      console.error('Error fetching module:', error);
      toast.error('Failed to fetch module');
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/modules`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter module name');
      return;
    }

    try {
      setSubmitting(true);
      await moduleService.updateModule(id!, {
        name: formData.name,
        description: formData.description,
      });

      toast.success('Module updated successfully');
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/modules`);
    } catch (error: any) {
      console.error('Error updating module:', error);
      toast.error(error.response?.data?.message || 'Failed to update module');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to edit modules.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => {
            const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
            navigate(`${basePath}/modules`);
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Module</h1>
          <p className="text-muted-foreground mt-1">
            Update the module details
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Module Details
          </CardTitle>
          <CardDescription>
            Update the details for this module. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Module Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Module Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics"
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a clear, descriptive name for your module
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter a brief description of the module"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Provide additional context about what this module covers
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Updating...' : 'Update Module'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
                  navigate(`${basePath}/modules`);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}