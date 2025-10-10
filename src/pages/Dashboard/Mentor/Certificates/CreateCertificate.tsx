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
import { schoolService, type School, type AvailableGrade } from '@/api/schoolService';
import { sessionService, type Session } from '@/api/sessionService';
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
  const [schools, setSchools] = useState<School[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<AvailableGrade[]>([]);
  const [hasServiceDetails, setHasServiceDetails] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    templateId: '',
    schoolId: '',
    grade: '',
    sessionId: '',
    accomplishment: '',
    validUntil: '',
    signatureName: '',
    signatureDesignation: '',
    signatureImage: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.schoolId && formData.grade) {
      loadStudents();
    }
  }, [formData.schoolId, formData.grade]);

  // Load school service details when school changes
  useEffect(() => {
    const fetchSchoolServiceDetails = async (schoolId: string) => {
      try {
        const response = await schoolService.getServiceDetails(schoolId);
        if (response.success) {
          setAvailableGrades(response.data.grades);
          setHasServiceDetails(response.data.hasServiceDetails);
        }
      } catch (error) {
        console.error('Error fetching school service details:', error);
        setAvailableGrades([]);
        setHasServiceDetails(false);
      }
    };

    if (formData.schoolId) {
      fetchSchoolServiceDetails(formData.schoolId);
    } else {
      setAvailableGrades([]);
      setHasServiceDetails(false);
    }
  }, [formData.schoolId]);

  // Load sessions when grade changes
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Extract numeric grade from "Grade X" format or use the number directly
        const gradeNumber = typeof formData.grade === 'string' 
          ? parseInt(formData.grade.replace(/\D/g, ''))
          : formData.grade;
        
        if (isNaN(gradeNumber)) {
          console.error('Invalid grade format:', formData.grade);
          setSessions([]);
          return;
        }
        
        const response = await sessionService.getSessionsByGrade(gradeNumber);
        setSessions(response || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast.error('Failed to load sessions');
        setSessions([]);
      }
    };

    if (formData.grade) {
      loadSessions();
    }
  }, [formData.grade]);

  const loadInitialData = async () => {
    try {
      const [templatesRes, schoolsRes] = await Promise.all([
        certificateService.getTemplates(),
        schoolService.getAll(),
      ]);

      setTemplates(templatesRes.data || []);
      setSchools(schoolsRes.data || []);
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
      if (formData.sessionId) {
        params.append('sessionId', formData.sessionId);
      }

      const response = await studentService.getForCertificate(params.toString());
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'schoolId') {
      // Reset grade and session when school changes
      setFormData(prev => ({ ...prev, [field]: value, grade: '', sessionId: '' }));
    } else if (field === 'grade') {
      // Reset session when grade changes
      setFormData(prev => ({ ...prev, [field]: value, sessionId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

  const handleSignatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          signatureImage: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
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
      
      // Handle signature image upload if present
      if (formData.signatureImage && formData.signatureImage.startsWith('data:')) {
        // For now, we'll send the base64 data directly
        // In a production environment, you'd want to upload the file to a server
        // and get back a file path/URL
        console.log('Signature image detected, sending as base64 data');
      }
      
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
                    <Select 
                      value={formData.grade} 
                      onValueChange={(value) => handleInputChange('grade', value)}
                      disabled={!formData.schoolId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {hasServiceDetails ? (
                          availableGrades.map((gradeData) => (
                            <SelectItem key={gradeData.grade} value={gradeData.grade.toString()}>
                              Grade {gradeData.grade}
                            </SelectItem>
                          ))
                        ) : (
                          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              Grade {grade}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {hasServiceDetails && availableGrades.length === 0 && formData.schoolId && (
                      <p className="text-sm text-muted-foreground">No grades available for this school. Please configure service details first.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session">Session (Optional)</Label>
                  <Select 
                    value={formData.sessionId} 
                    onValueChange={(value) => handleInputChange('sessionId', value)}
                    disabled={!formData.grade}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select session (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific session</SelectItem>
                      {sessions.length > 0 ? (
                        sessions.map((session) => (
                          <SelectItem key={session._id} value={session._id!}>
                            {session.displayName || `${session.grade}.${session.sessionNumber} ${session.name}`}
                          </SelectItem>
                        ))
                      ) : formData.grade ? (
                        <SelectItem value="no-sessions" disabled>No sessions available</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  {sessions.length === 0 && formData.grade && (
                    <p className="text-sm text-muted-foreground">No sessions found for Grade {formData.grade}. Please create sessions first.</p>
                  )}
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
                  <Label htmlFor="signatureImage">Signature Image (Optional)</Label>
                  <div className="space-y-2">
                    <Input
                      id="signatureImage"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureImageChange}
                      className="cursor-pointer"
                    />
                    {formData.signatureImage && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img 
                          src={formData.signatureImage} 
                          alt="Signature preview" 
                          className="max-w-[200px] max-h-[80px] object-contain border rounded"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Upload a signature image (JPG, PNG, GIF). Recommended size: 200x80px
                    </p>
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
