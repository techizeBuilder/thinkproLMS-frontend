import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function CreateModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Check if user has permission to manage modules
  const hasPermission = user?.permissions?.includes('add_modules');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter module name');
      return;
    }

    try {
      setSubmitting(true);
      await moduleService.createModule({
        name: formData.name,
        description: formData.description,
      });

      toast.success('Module created successfully');
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/modules`);
    } catch (error: any) {
      console.error('Error creating module:', error);
      toast.error(error.response?.data?.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to create modules.
          </AlertDescription>
        </Alert>
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
          <h1 className="text-3xl font-bold">Create New Module</h1>
          <p className="text-muted-foreground mt-1">
            Add a new module to organize your curriculum
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
            Enter the details for the new module. All fields marked with * are required.
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
                {submitting ? 'Creating...' : 'Create Module'}
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