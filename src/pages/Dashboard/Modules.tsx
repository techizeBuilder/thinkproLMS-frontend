import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Edit,
  Trash2, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  FileText,
  Folder
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  moduleService, 
  type Module
} from '@/api/moduleService';
import { useAuth } from '@/contexts/AuthContext';

export default function Modules() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Check if user has permission to manage modules
  const hasPermission = user?.role === 'superadmin' || user?.permissions?.includes('add_modules');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const modulesData = await moduleService.getAllModules();
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (module: Module) => {
    if (!window.confirm(`Are you sure you want to delete this module for Grade ${module.grade} - ${module.subject.name}?`)) {
      return;
    }

    try {
      await moduleService.deleteModule(module._id);
      setModules(modules.filter(m => m._id !== module._id));
      toast.success('Module deleted successfully');
    } catch (error: any) {
      console.error('Error deleting module:', error);
      toast.error(error.response?.data?.message || 'Failed to delete module');
    }
  };

  const openEditPage = (module: Module) => {
    navigate(`/leadmentor/modules/${module._id}/edit`);
  };


  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to manage modules. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Modules Management</h1>
          <p className="text-muted-foreground">
            Create and manage learning modules with topics and subtopics
          </p>
        </div>
        <Button onClick={() => navigate('/leadmentor/modules/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
          <CardDescription>
            Manage all learning modules in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first module.
              </p>
              <Button onClick={() => navigate('/leadmentor/modules/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module._id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Layers className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            Grade {module.grade} - {module.subject.name}
                          </CardTitle>
                          <CardDescription>
                            {module.modules.length} module(s) • Created {new Date(module.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleModuleExpansion(module._id)}
                        >
                          {expandedModules.has(module._id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditPage(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(module)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <Collapsible open={expandedModules.has(module._id)}>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {module.modules.map((moduleItem, moduleIndex) => (
                            <Card key={moduleIndex} className="border-l-4 border-l-blue-200">
                              <CardHeader className="pb-3">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4" />
                                  <CardTitle className="text-base">
                                    Module {moduleIndex + 1}: {moduleItem.name}
                                  </CardTitle>
                                </div>
                                {moduleItem.description && (
                                  <CardDescription>{moduleItem.description}</CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  {moduleItem.topics.map((topic, topicIndex) => (
                                    <Card key={topicIndex} className="border-l-4 border-l-green-200">
                                      <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4" />
                                            <CardTitle className="text-sm">
                                              Topic {topicIndex + 1}: {topic.name}
                                            </CardTitle>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleTopicExpansion(`${module._id}-${moduleIndex}-${topicIndex}`)}
                                          >
                                            {expandedTopics.has(`${module._id}-${moduleIndex}-${topicIndex}`) ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </div>
                                        {topic.description && (
                                          <CardDescription className="text-xs">{topic.description}</CardDescription>
                                        )}
                                      </CardHeader>
                                      <Collapsible open={expandedTopics.has(`${module._id}-${moduleIndex}-${topicIndex}`)}>
                                        <CollapsibleContent>
                                          <CardContent className="pt-0">
                                            <div className="space-y-2">
                                              {topic.subtopics.map((subTopic, subTopicIndex) => (
                                                <div key={subTopicIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                                                  <Folder className="h-3 w-3" />
                                                  <span className="text-sm">
                                                    Sub Topic {subTopicIndex + 1}: {subTopic.name}
                                                  </span>
                                                  {subTopic.description && (
                                                    <span className="text-xs text-muted-foreground">
                                                      - {subTopic.description}
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </CardContent>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
