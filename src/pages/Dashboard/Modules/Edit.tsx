import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  moduleService, 
  type Module,
  type ModuleItem, 
  type Topic, 
  type SubTopic
} from '@/api/moduleService';
import { useAuth } from '@/contexts/AuthContext';

export default function EditModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    grade: '',
    subjectId: '',
    modules: [] as ModuleItem[]
  });

  // Check if user has permission to manage modules
  const hasPermission = user?.permissions?.includes('add_modules');

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const moduleData = await moduleService.getModuleById(id!);
      setModule(moduleData);
      
      // Pre-populate form with existing data
      setFormData({
        grade: moduleData.grade.toString(),
        subjectId: moduleData.subject._id,
        modules: moduleData.modules
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch module data');
      navigate('/leadmentor/modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.grade || !formData.subjectId || formData.modules.length === 0) {
        toast.error('Please fill in all required fields and add at least one module');
        return;
      }

      setSubmitting(true);
      await moduleService.updateModule(id!, {
        modules: formData.modules,
      });

      toast.success('Module updated successfully');
      navigate('/leadmentor/modules');
    } catch (error: any) {
      console.error('Error updating module:', error);
      toast.error(error.response?.data?.message || 'Failed to update module');
    } finally {
      setSubmitting(false);
    }
  };

  const addModuleItem = () => {
    const newModuleItem: ModuleItem = {
      name: '',
      description: '',
      topics: []
    };
    setFormData({
      ...formData,
      modules: [...formData.modules, newModuleItem]
    });
  };

  const updateModuleItem = (index: number, field: keyof ModuleItem, value: any) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeModuleItem = (index: number) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
  };

  const addTopic = (moduleIndex: number) => {
    const newTopic: Topic = {
      name: '',
      description: '',
      subtopics: []
    };
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics = [...updatedModules[moduleIndex].topics, newTopic];
    setFormData({ ...formData, modules: updatedModules });
  };

  const updateTopic = (moduleIndex: number, topicIndex: number, field: keyof Topic, value: any) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics[topicIndex] = {
      ...updatedModules[moduleIndex].topics[topicIndex],
      [field]: value
    };
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeTopic = (moduleIndex: number, topicIndex: number) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics = updatedModules[moduleIndex].topics.filter((_, i) => i !== topicIndex);
    setFormData({ ...formData, modules: updatedModules });
  };

  const addSubTopic = (moduleIndex: number, topicIndex: number) => {
    const newSubTopic: SubTopic = {
      name: '',
      description: ''
    };
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics[topicIndex].subtopics = [
      ...updatedModules[moduleIndex].topics[topicIndex].subtopics,
      newSubTopic
    ];
    setFormData({ ...formData, modules: updatedModules });
  };

  const updateSubTopic = (moduleIndex: number, topicIndex: number, subTopicIndex: number, field: keyof SubTopic, value: any) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics[topicIndex].subtopics[subTopicIndex] = {
      ...updatedModules[moduleIndex].topics[topicIndex].subtopics[subTopicIndex],
      [field]: value
    };
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeSubTopic = (moduleIndex: number, topicIndex: number, subTopicIndex: number) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].topics[topicIndex].subtopics = 
      updatedModules[moduleIndex].topics[topicIndex].subtopics.filter((_, i) => i !== subTopicIndex);
    setFormData({ ...formData, modules: updatedModules });
  };

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to edit modules. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Module not found</h3>
              <p className="text-muted-foreground">
                The module you're looking for doesn't exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/leadmentor/modules')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Modules
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Module</h1>
          <p className="text-muted-foreground">
            Edit Grade {module.grade} - {module.subject.name} module
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Module information (grade and subject cannot be changed)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  value={`Grade ${formData.grade}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  value={module.subject.name}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Modules</CardTitle>
                <CardDescription>
                  Edit modules with topics and subtopics
                </CardDescription>
              </div>
              <Button onClick={addModuleItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.modules.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No modules</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first module to get started.
                </p>
                <Button onClick={addModuleItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.modules.map((moduleItem, moduleIndex) => (
                  <Card key={moduleIndex} className="border-l-4 border-l-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Module {moduleIndex + 1}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeModuleItem(moduleIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Module Name *</Label>
                        <Input
                          value={moduleItem.name}
                          onChange={(e) => updateModuleItem(moduleIndex, 'name', e.target.value)}
                          placeholder="Enter module name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={moduleItem.description || ''}
                          onChange={(e) => updateModuleItem(moduleIndex, 'description', e.target.value)}
                          placeholder="Enter module description"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Topics</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTopic(moduleIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Topic
                          </Button>
                        </div>
                        
                        {moduleItem.topics.map((topic, topicIndex) => (
                          <Card key={topicIndex} className="mb-3 border-l-4 border-l-green-200">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Topic {topicIndex + 1}</CardTitle>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeTopic(moduleIndex, topicIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <Label>Topic Name *</Label>
                                <Input
                                  value={topic.name}
                                  onChange={(e) => updateTopic(moduleIndex, topicIndex, 'name', e.target.value)}
                                  placeholder="Enter topic name"
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={topic.description || ''}
                                  onChange={(e) => updateTopic(moduleIndex, topicIndex, 'description', e.target.value)}
                                  placeholder="Enter topic description"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Sub Topics</Label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSubTopic(moduleIndex, topicIndex)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Sub Topic
                                  </Button>
                                </div>
                                
                                {topic.subtopics.map((subTopic, subTopicIndex) => (
                                  <Card key={subTopicIndex} className="mb-2 border-l-4 border-l-purple-200">
                                    <CardContent className="pt-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Sub Topic {subTopicIndex + 1}</span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeSubTopic(moduleIndex, topicIndex, subTopicIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="space-y-2">
                                        <Input
                                          value={subTopic.name}
                                          onChange={(e) => updateSubTopic(moduleIndex, topicIndex, subTopicIndex, 'name', e.target.value)}
                                          placeholder="Enter sub topic name"
                                        />
                                        <Textarea
                                          value={subTopic.description || ''}
                                          onChange={(e) => updateSubTopic(moduleIndex, topicIndex, subTopicIndex, 'description', e.target.value)}
                                          placeholder="Enter sub topic description"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/leadmentor/modules')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Module'}
          </Button>
        </div>
      </div>
    </div>
  );
}
