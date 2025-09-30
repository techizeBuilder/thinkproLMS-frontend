import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { sessionService } from '@/api/sessionService';
import { moduleService, Module } from '@/api/moduleService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EditSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewModuleInput, setShowNewModuleInput] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    moduleId: '',
    description: '',
  });

  // Check if user has permission to manage sessions
  const hasPermission = user?.permissions?.includes('add_modules');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [session, modulesData] = await Promise.all([
        sessionService.getSessionById(id!),
        moduleService.getAllModules(),
      ]);

      setModules(modulesData);
      setFormData({
        name: session.name,
        moduleId: typeof session.module === 'object' ? session.module._id! : session.module,
        description: session.description || '',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch session');
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/sessions`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewModule = async () => {
    if (!newModuleName.trim()) {
      toast.error('Please enter module name');
      return;
    }

    try {
      const newModule = await moduleService.createModule({
        name: newModuleName,
      });
      setModules([...modules, newModule]);
      setFormData({ ...formData, moduleId: newModule._id! });
      setNewModuleName('');
      setShowNewModuleInput(false);
      toast.success('Module created successfully');
    } catch (error: any) {
      console.error('Error creating module:', error);
      toast.error(error.response?.data?.message || 'Failed to create module');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.moduleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await sessionService.updateSession(id!, {
        name: formData.name,
        moduleId: formData.moduleId,
        description: formData.description,
      });

      toast.success('Session updated successfully');
      const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
      navigate(`${basePath}/sessions`);
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error(error.response?.data?.message || 'Failed to update session');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to edit sessions.
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
            navigate(`${basePath}/sessions`);
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Session</h1>
          <p className="text-muted-foreground mt-1">
            Update the session details
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Session Details
          </CardTitle>
          <CardDescription>
            Update the details for this session. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Session Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introduction to Algebra"
                required
              />
            </div>

            {/* Module Selection */}
            <div className="space-y-2">
              <Label htmlFor="module">
                Module <span className="text-destructive">*</span>
              </Label>
              {showNewModuleInput ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Create New Module</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      placeholder="Enter module name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateNewModule}
                      size="sm"
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowNewModuleInput(false);
                        setNewModuleName('');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Select
                    value={formData.moduleId}
                    onValueChange={(value) => setFormData({ ...formData, moduleId: value })}
                  >
                    <SelectTrigger id="module">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module._id} value={module._id!}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowNewModuleInput(true)}
                    className="h-auto p-0 text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Module
                  </Button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter a brief description of the session"
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Updating...' : 'Update Session'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const basePath = user?.role === 'superadmin' ? '/superadmin' : '/leadmentor';
                  navigate(`${basePath}/sessions`);
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