import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Save,
  Eye,
  Users,
  Award,
  FileText,
  Loader2
} from 'lucide-react';
import { certificateService, type CertificateTemplate } from '@/api/certificateService';
import { schoolService } from '@/api/schoolService';
import { subjectService } from '@/api/subjectService';
import { studentService } from '@/api/studentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  grade: string;
}

export default function CreateCertificatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper function to get the correct base path based on user role
  const getBasePath = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/mentor'; // fallback
  };
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templateId: '',
    schoolId: '',
    grade: '',
    subjectId: '',
    accomplishment: '',
    validUntil: '',
    signatureName: '',
    signatureDesignation: '',
    signatureImage: '',
  });

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.schoolId && formData.grade) {
      loadStudents();
    }
  }, [formData.schoolId, formData.grade]);

  const loadInitialData = async () => {
    try {
      const [templatesRes, schoolsRes, subjectsRes] = await Promise.all([
        certificateService.getTemplates(),
        schoolService.getAll(),
        subjectService.getAllSubjects(),
      ]);

      setTemplates(templatesRes.data || []);
      setSchools(schoolsRes.data || []);
      setSubjects(subjectsRes || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load required data');
    }
  };

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams({
        schoolId: formData.schoolId,
        grade: formData.grade,
      });
      if (formData.subjectId) {
        params.append('subjectId', formData.subjectId);
      }

      const response = await studentService.getForCertificate(params.toString());
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(student => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.templateId || !formData.schoolId || !formData.grade || 
        !formData.accomplishment || !formData.signatureName || !formData.signatureDesignation) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      setLoading(true);
      const certificateData = {
        ...formData,
        studentIds: selectedStudents,
      };

      await certificateService.create(certificateData);
      toast.success('Certificate created successfully');
      navigate(`${getBasePath()}/certificates`);
    } catch (error) {
      console.error('Error creating certificate:', error);
      toast.error('Failed to create certificate');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!formData.title || !formData.templateId || !formData.schoolId || !formData.grade) {
      toast.error('Please fill in the basic information first');
      return;
    }
    
    // Navigate to preview page with form data
    navigate(`${getBasePath()}/certificates/preview`, { 
      state: { 
        formData, 
        selectedStudents: students.filter(s => selectedStudents.includes(s._id))
      } 
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${getBasePath()}/certificates`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Certificate</h1>
          <p className="text-muted-foreground">
            Create a new course completion certificate
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Certificate Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Course Completion Certificate"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Template *</Label>
                    <Select value={formData.templateId} onValueChange={(value) => handleInputChange('templateId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template._id} value={template._id}>
                            {template.name}
                          </SelectItem>
                        ))}
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
                    placeholder="Optional description for the certificate"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accomplishment">Accomplishment Text *</Label>
                  <Textarea
                    id="accomplishment"
                    value={formData.accomplishment}
                    onChange={(e) => handleInputChange('accomplishment', e.target.value)}
                    placeholder="e.g., has successfully completed the Mathematics course with excellence"
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* School and Grade Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  School & Grade Selection
                </CardTitle>
                <CardDescription>
                  Select the school and grade for the certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">School *</Label>
                    <Select value={formData.schoolId} onValueChange={(value) => handleInputChange('schoolId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school._id} value={school._id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select value={formData.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Signature Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Signature Information
                </CardTitle>
                <CardDescription>
                  Enter the signature details for the certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureName">Signature Name *</Label>
                    <Input
                      id="signatureName"
                      value={formData.signatureName}
                      onChange={(e) => handleInputChange('signatureName', e.target.value)}
                      placeholder="e.g., Dr. John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signatureDesignation">Signature Designation *</Label>
                    <Input
                      id="signatureDesignation"
                      value={formData.signatureDesignation}
                      onChange={(e) => handleInputChange('signatureDesignation', e.target.value)}
                      placeholder="e.g., Principal"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Selection
                </CardTitle>
                <CardDescription>
                  Select students to receive the certificate
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!formData.schoolId || !formData.grade ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Please select school and grade first</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No students found for the selected criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="selectAll"
                        checked={selectedStudents.length === students.length}
                        onCheckedChange={handleSelectAllStudents}
                      />
                      <Label htmlFor="selectAll" className="font-medium">
                        Select All ({students.length} students)
                      </Label>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {students.map((student) => (
                        <div key={student._id} className="flex items-center space-x-2 p-2 rounded border">
                          <Checkbox
                            id={student._id}
                            checked={selectedStudents.includes(student._id)}
                            onCheckedChange={(checked) => 
                              handleStudentSelection(student._id, checked as boolean)
                            }
                          />
                          <Label htmlFor={student._id} className="flex-1 cursor-pointer">
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.studentId} • {student.email}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {selectedStudents.length} of {students.length} students selected
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handlePreview}
                    disabled={!formData.title || !formData.templateId || !formData.schoolId || !formData.grade}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Certificate
                  </Button>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || selectedStudents.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Certificate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
