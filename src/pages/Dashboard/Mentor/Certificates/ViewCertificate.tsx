import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Send,
  FileText,
  Calendar,
  Users,
  Award,
  User
} from 'lucide-react';
import { certificateService, type Certificate } from '@/api/certificateService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ViewCertificate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get the correct base path based on user role
  const getBasePath = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/mentor'; // fallback
  };

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await certificateService.getById(id!);
      setCertificate(response.data);
    } catch (error) {
      console.error('Error loading certificate:', error);
      toast.error('Failed to load certificate');
      navigate(`${getBasePath()}/certificates`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCertificate = async () => {
    try {
      const response = await certificateService.preview(id!);
      navigate(`${getBasePath()}/certificates/${id}/preview`, { 
        state: { previewData: response.data } 
      });
    } catch (error) {
      console.error('Error previewing certificate:', error);
      toast.error('Failed to preview certificate');
    }
  };

  const handleGenerateCertificates = async () => {
    try {
      await certificateService.generateAndSend(id!);
      toast.success('Certificates generated successfully');
      loadCertificate(); // Reload to get updated status
    } catch (error) {
      console.error('Error generating certificates:', error);
      toast.error('Failed to generate certificates');
    }
  };

  const handleDownloadStudentCertificate = async (studentId: string, studentName: string) => {
    try {
      await certificateService.downloadCertificate(id!, studentId, `certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
      toast.success(`Certificate downloaded for ${studentName}`);
      loadCertificate(); // Reload to get updated download status
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleDownloadAllCertificates = async () => {
    const generatedRecipients = certificate?.recipients.filter(r => 
      r.status === 'generated' || r.status === 'sent' || r.status === 'downloaded'
    ) || [];

    if (generatedRecipients.length === 0) {
      toast.error('No generated certificates to download');
      return;
    }

    try {
      // Download certificates one by one
      for (const recipient of generatedRecipients) {
        const studentName = recipient.student?.user?.name || 'Unknown Student';
        await certificateService.downloadCertificate(
          id!, 
          recipient.student._id, 
          `certificate_${studentName.replace(/\s+/g, '_')}.pdf`
        );
      }
      toast.success(`Downloaded ${generatedRecipients.length} certificates`);
      loadCertificate(); // Reload to get updated download status
    } catch (error) {
      console.error('Error downloading certificates:', error);
      toast.error('Failed to download some certificates');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Certificate not found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The certificate you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate(`${getBasePath()}/certificates`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Certificates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusCounts = getRecipientStatusCounts(certificate.recipients);
  const totalRecipients = certificate.recipients.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold">{certificate.title}</h1>
            <p className="text-muted-foreground">
              {certificate.accomplishment}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(
            certificate.recipients.some(r => r.status === 'downloaded') ? 'downloaded' :
            certificate.recipients.some(r => r.status === 'sent') ? 'sent' :
            certificate.recipients.some(r => r.status === 'generated') ? 'generated' : 'pending'
          )}
        </div>
      </div>

      {/* Certificate Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {certificate.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{certificate.description}</p>
                </div>
              )}

              {certificate.signature && (
                <div>
                  <span className="text-sm text-muted-foreground">Signature:</span>
                  <p className="text-sm mt-1">
                    {certificate.signature.name} - {certificate.signature.designation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients List */}
          <Card>
            <CardHeader>
              <CardTitle>Recipients ({totalRecipients})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {certificate.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {recipient.student?.user?.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {recipient.student?.studentId || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(recipient.status)}
                      {recipient.certificateNumber && (
                        <span className="text-xs text-muted-foreground">
                          #{recipient.certificateNumber}
                        </span>
                      )}
                      {(recipient.status === 'generated' || recipient.status === 'sent' || recipient.status === 'downloaded') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadStudentCertificate(
                            recipient.student._id, 
                            recipient.student?.user?.name || 'Unknown Student'
                          )}
                          className="ml-2"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePreviewCertificate}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Certificate
              </Button>
              
              {certificate.recipients.some(r => r.status === 'generated') ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateCertificates}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Resend Certificates
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleGenerateCertificates}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Certificates
                </Button>
              )}

              {certificate.recipients.some(r => r.status === 'generated' || r.status === 'sent' || r.status === 'downloaded') && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadAllCertificates}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Certificates
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{status}:</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
