import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  Send,
  Users,
  FileText,
  Calendar,
  Award,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { certificateService } from '@/api/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PreviewData {
  certificate: {
    title: string;
    accomplishment: string;
    grade: string;
    school: {
      name: string;
      city: string;
      state: string;
    };
  };
  students: Array<{
    studentId: string;
    studentName: string;
    certificateNumber: string;
    status: string;
  }>;
  totalStudents: number;
}

export default function CertificatePreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Helper function to get the correct base path based on user role
  const getBasePath = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/mentor'; // fallback
  };

  const certificateId = location.pathname.split('/')[3]; // Extract from URL
  const formData = location.state?.formData;
  const selectedStudents = location.state?.selectedStudents;

  useEffect(() => {
    if (formData && selectedStudents) {
      // Create preview data from form data
      const mockPreviewData: PreviewData = {
        certificate: {
          title: formData.title,
          accomplishment: formData.accomplishment,
          grade: formData.grade,
          school: {
            name: 'Selected School', // This would be populated from the selected school
            city: 'City',
            state: 'State',
          },
        },
        students: selectedStudents.map((student: any, index: number) => ({
          studentId: student._id,
          studentName: student.name,
          certificateNumber: `CERT-${Date.now()}-${index}`,
          status: 'pending',
        })),
        totalStudents: selectedStudents.length,
      };
      setPreviewData(mockPreviewData);
    } else if (certificateId) {
      loadPreviewData();
    }
  }, [certificateId, formData, selectedStudents]);

  const loadPreviewData = async () => {
    try {
      setLoading(true);
      const response = await certificateService.preview(certificateId);
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error loading preview data:', error);
      toast.error('Failed to load preview data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!certificateId) {
      toast.error('Certificate ID not found');
      return;
    }

    try {
      setGenerating(true);
      const response = await certificateService.generateAndSend(certificateId);
      toast.success(response.message);
      
      // Reload preview data to show updated status
      await loadPreviewData();
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      generated: { variant: 'default' as const, label: 'Generated', icon: FileText },
      sent: { variant: 'default' as const, label: 'Sent', icon: Send },
      downloaded: { variant: 'default' as const, label: 'Downloaded', icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    if (!previewData) return {};
    
    return previewData.students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No preview data available</h3>
          <p className="text-muted-foreground mb-4">
            Unable to load certificate preview data.
          </p>
          <Button onClick={() => navigate(`${getBasePath()}/certificates`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Button>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

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
          <h1 className="text-3xl font-bold">Certificate Preview</h1>
          <p className="text-muted-foreground">
            Preview and manage certificate recipients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{previewData.certificate.title}</h3>
                <p className="text-muted-foreground mt-1">
                  {previewData.certificate.accomplishment}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">School:</span>
                  <span className="text-sm font-medium">
                    {previewData.certificate.school.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Grade:</span>
                  <span className="text-sm font-medium">
                    {previewData.certificate.grade}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">
                    {previewData.certificate.school.city}, {previewData.certificate.school.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Recipients:</span>
                  <span className="text-sm font-medium">
                    {previewData.totalStudents}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
              <CardDescription>
                Current status of certificate generation and distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>
                List of students who will receive this certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {previewData.students.map((student) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {student.studentId} • Certificate: {student.certificateNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(student.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Manage certificate generation and distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificateId && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleGenerateCertificates}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate Certificates
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`${getBasePath()}/certificates/${certificateId}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </>
              )}

              {!certificateId && (
                <Button
                  className="w-full"
                  onClick={() => navigate(`${getBasePath()}/certificates/create`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Certificate
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Students:</span>
                <span className="text-sm font-medium">{previewData.totalStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pending:</span>
                <span className="text-sm font-medium">{statusCounts.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Generated:</span>
                <span className="text-sm font-medium">{statusCounts.generated || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sent:</span>
                <span className="text-sm font-medium">{statusCounts.sent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Downloaded:</span>
                <span className="text-sm font-medium">{statusCounts.downloaded || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
