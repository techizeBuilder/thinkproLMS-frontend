import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  Eye,
  Award,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  User
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

export default function StudentCertificatesPage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadStudentCertificates();
  }, []);

  const loadStudentCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateService.getStudentCertificates();
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error loading student certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId: string, certificateNumber: string) => {
    try {
      setDownloading(certificateId);
      
      await certificateService.downloadStudentCertificate(
        certificateId, 
        `certificate_${certificateNumber}.pdf`
      );
      
      toast.success('Certificate downloaded successfully');
      // Reload certificates to update download status
      loadStudentCertificates();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewCertificate = (certificateId: string) => {
    navigate(`/student/certificates/${certificateId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        variant: 'secondary' as const, 
        label: 'Pending', 
        icon: Clock,
        description: 'Certificate is being prepared'
      },
      generated: { 
        variant: 'default' as const, 
        label: 'Ready', 
        icon: FileText,
        description: 'Certificate is ready for download'
      },
      sent: { 
        variant: 'default' as const, 
        label: 'Sent', 
        icon: CheckCircle,
        description: 'Certificate has been sent to you'
      },
      downloaded: { 
        variant: 'default' as const, 
        label: 'Downloaded', 
        icon: CheckCircle,
        description: 'You have downloaded this certificate'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={config.variant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <span className="text-xs text-muted-foreground">{config.description}</span>
      </div>
    );
  };

  const canDownload = (status: string) => {
    return status === 'generated' || status === 'sent' || status === 'downloaded';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your course completion certificates
        </p>
      </div>

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground text-center">
              You haven't received any certificates yet. Complete courses to earn certificates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {certificates.map((certificate) => (
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
                    {getStatusBadge(certificate.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                {certificate.subject && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Subject:</span>
                      <span className="text-sm font-medium">{certificate.subject.name}</span>
                    </div>
                  </div>
                )}

                {certificate.validUntil && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Valid until:</span>
                      <span className="text-sm font-medium">
                        {new Date(certificate.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Signed by:</div>
                  <div className="font-medium">{certificate.signature.name}</div>
                  <div className="text-sm text-muted-foreground">{certificate.signature.designation}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCertificate(certificate._id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  
                  {canDownload(certificate.status) && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadCertificate(certificate._id, certificate.certificateNumber)}
                      disabled={downloading === certificate._id}
                    >
                      {downloading === certificate._id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
