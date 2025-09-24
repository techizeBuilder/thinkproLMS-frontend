import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Eye, 
  Download, 
  Send,
  FileText,
  Calendar,
  Users,
  Award,
  Filter
} from 'lucide-react';
import { certificateService, type Certificate } from '@/api/certificateService';
import { schoolService } from '@/api/schoolService';
import { subjectService } from '@/api/subjectService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get the correct base path based on user role
  const getBasePath = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/mentor'; // fallback
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [schools, setSchools] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'generated', label: 'Generated' },
    { value: 'sent', label: 'Sent' },
    { value: 'downloaded', label: 'Downloaded' },
  ];

  useEffect(() => {
    loadCertificates();
    loadSchools();
    loadSubjects();
  }, []);

  // Refresh certificates when location changes (e.g., when navigating back from create)
  useEffect(() => {
    loadCertificates();
  }, [location.pathname]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSchool && selectedSchool !== 'all') params.append('school', selectedSchool);
      if (selectedGrade && selectedGrade !== 'all') params.append('grade', selectedGrade);
      if (selectedSubject && selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await certificateService.getAll(params.toString());
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await schoolService.getAll();
      setSchools(response.data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await subjectService.getAllSubjects();
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadCertificates();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSchool, selectedGrade, selectedSubject, selectedStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      generated: { variant: 'default' as const, label: 'Generated' },
      sent: { variant: 'default' as const, label: 'Sent' },
      downloaded: { variant: 'default' as const, label: 'Downloaded' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRecipientStatusCounts = (recipients: any[]) => {
    const counts = recipients.reduce((acc, recipient) => {
      acc[recipient.status] = (acc[recipient.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  };

  const handleCreateCertificate = () => {
    navigate(`${getBasePath()}/certificates/create`);
  };

  const handleViewCertificate = (certificateId: string) => {
    navigate(`${getBasePath()}/certificates/${certificateId}`);
  };

  const handlePreviewCertificate = async (certificateId: string) => {
    try {
      const response = await certificateService.preview(certificateId);
      navigate(`${getBasePath()}/certificates/${certificateId}/preview`, { 
        state: { previewData: response.data } 
      });
    } catch (error) {
      console.error('Error previewing certificate:', error);
      toast.error('Failed to preview certificate');
    }
  };

  const handleGenerateCertificates = async (certificateId: string) => {
    try {
      await certificateService.generateAndSend(certificateId);
      toast.success('Certificates generated successfully');
      loadCertificates();
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
    }
  };

  const handleDownloadAllCertificates = async (certificateId: string) => {
    try {
      // Get the certificate to find generated recipients
      const certificate = certificates.find(c => c._id === certificateId);
      if (!certificate) {
        toast.error('Certificate not found');
        return;
      }

      const generatedRecipients = certificate.recipients.filter(r => 
        r.status === 'generated' || r.status === 'sent' || r.status === 'downloaded'
      );

      if (generatedRecipients.length === 0) {
        toast.error('No generated certificates to download');
        return;
      }

      // Download certificates one by one
      for (const recipient of generatedRecipients) {
        const studentName = recipient.student?.user?.name || 'Unknown Student';
        await certificateService.downloadCertificate(
          certificateId, 
          recipient.student._id, 
          `certificate_${studentName.replace(/\s+/g, '_')}.pdf`
        );
      }
      toast.success(`Downloaded ${generatedRecipients.length} certificates`);
      loadCertificates(); // Reload to get updated download status
    } catch (error) {
      console.error('Error downloading certificates:', error);
      toast.error('Failed to download some certificates');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSchool('all');
    setSelectedGrade('all');
    setSelectedSubject('all');
    setSelectedStatus('all');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground">
            Create and manage course completion certificates
          </p>
        </div>
        <Button onClick={handleCreateCertificate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Certificate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger>
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school._id} value={school._id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading certificates...</p>
            </div>
          </div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certificates found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || (selectedSchool !== 'all') || (selectedGrade !== 'all') || (selectedSubject !== 'all') || (selectedStatus !== 'all')
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first certificate to get started.'}
              </p>
              {!searchTerm && selectedSchool === 'all' && selectedGrade === 'all' && selectedSubject === 'all' && selectedStatus === 'all' && (
                <Button onClick={handleCreateCertificate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Certificate
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          certificates.map((certificate) => {
            const statusCounts = getRecipientStatusCounts(certificate.recipients);
            const totalRecipients = certificate.recipients.length;

            return (
              <Card key={certificate._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{certificate.title}</CardTitle>
                      <CardDescription className="text-base">
                        {certificate.accomplishment}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(
                        certificate.recipients.some(r => r.status === 'downloaded') ? 'downloaded' :
                        certificate.recipients.some(r => r.status === 'sent') ? 'sent' :
                        certificate.recipients.some(r => r.status === 'generated') ? 'generated' : 'pending'
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">School:</span>
                      <span className="text-sm font-medium">{certificate.school?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Grade:</span>
                      <span className="text-sm font-medium">{certificate.grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm font-medium">
                        {new Date(certificate.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Recipients:</span>
                      <span className="text-sm font-medium">{totalRecipients}</span>
                    </div>
                  </div>

                  {/* Status breakdown */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm text-muted-foreground">Status breakdown:</span>
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <Badge key={status} variant="outline" className="text-xs">
                        {status}: {String(count)}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCertificate(certificate._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewCertificate(certificate._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {certificate.recipients.some(r => r.status === 'generated') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateCertificates(certificate._id)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    {!certificate.recipients.some(r => r.status === 'generated') && (
                      <Button
                        size="sm"
                        onClick={() => handleGenerateCertificates(certificate._id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    )}
                    {certificate.recipients.some(r => r.status === 'generated' || r.status === 'sent' || r.status === 'downloaded') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadAllCertificates(certificate._id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
