import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  FileText,
  Calendar,
  User,
  Award,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { certificateService } from '@/api/certificateService';
import { toast } from 'sonner';

interface StudentCertificate {
  _id: string;
  title: string;
  description?: string;
  accomplishment: string;
  school: {
    name: string;
    city: string;
    state: string;
  };
  grade: string;
  subject?: {
    name: string;
  };
  issuedDate: string;
  validUntil?: string;
  signature: {
    name: string;
    designation: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: 'pending' | 'generated' | 'sent' | 'downloaded';
  certificateNumber: string;
  generatedAt?: string;
  sentAt?: string;
  downloadedAt?: string;
  pdfPath?: string;
}

export default function StudentCertificateViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<StudentCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      // Get all student certificates and find the one with matching ID
      const response = await certificateService.getStudentCertificates();
      const certificates = response.data || [];
      const foundCertificate = certificates.find(cert => cert._id === id);
      
      if (foundCertificate) {
        setCertificate(foundCertificate);
      } else {
        toast.error('Certificate not found');
        navigate('/student/certificates');
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      toast.error('Failed to load certificate');
      navigate('/student/certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    
    try {
      setDownloading(true);
      await certificateService.downloadStudentCertificate(
        certificate._id, 
        `certificate_${certificate.certificateNumber}.pdf`
      );
      toast.success('Certificate downloaded successfully');
      // Reload certificate to update download status
      loadCertificate();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      generated: { variant: 'default' as const, label: 'Generated', icon: CheckCircle },
      sent: { variant: 'default' as const, label: 'Sent', icon: CheckCircle },
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
            <Button onClick={() => navigate('/student/certificates')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Certificates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/certificates')}
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
          {getStatusBadge(certificate.status)}
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
                  <span className="text-sm font-medium">{certificate.school.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Grade:</span>
                  <span className="text-sm font-medium">{certificate.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Issued:</span>
                  <span className="text-sm font-medium">
                    {new Date(certificate.issuedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Certificate #:</span>
                  <span className="text-sm font-medium">{certificate.certificateNumber}</span>
                </div>
              </div>

              {certificate.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{certificate.description}</p>
                </div>
              )}

              {certificate.subject && (
                <div>
                  <span className="text-sm text-muted-foreground">Subject:</span>
                  <p className="text-sm mt-1">{certificate.subject.name}</p>
                </div>
              )}

              {certificate.validUntil && (
                <div>
                  <span className="text-sm text-muted-foreground">Valid Until:</span>
                  <p className="text-sm mt-1">
                    {new Date(certificate.validUntil).toLocaleDateString()}
                  </p>
                </div>
              )}

              {certificate.signature && (
                <div>
                  <span className="text-sm text-muted-foreground">Signed by:</span>
                  <p className="text-sm mt-1">
                    {certificate.signature.name} - {certificate.signature.designation}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm text-muted-foreground">Created by:</span>
                <p className="text-sm mt-1">
                  {certificate.createdBy.name} ({certificate.createdBy.email})
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Certificate Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(certificate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {certificate.generatedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Certificate Generated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.sentAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Certificate Sent</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.downloadedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Certificate Downloaded</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(certificate.downloadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
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
              {(certificate.status === 'generated' || certificate.status === 'sent' || certificate.status === 'downloaded') && (
                <Button
                  className="w-full"
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate
                    </>
                  )}
                </Button>
              )}

              {certificate.status === 'pending' && (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Your certificate is being prepared. Please check back later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificate Info */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(certificate.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Certificate #:</span>
                <span className="text-sm font-medium">{certificate.certificateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Issued Date:</span>
                <span className="text-sm font-medium">
                  {new Date(certificate.issuedDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
