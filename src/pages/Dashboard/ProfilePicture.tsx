import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import ProfilePictureDisplay from '@/components/ProfilePictureDisplay';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/api/axiosInstance';

export default function ProfilePicturePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await axiosInstance.get('/profile-picture');
        if (response.data.success) {
          setProfilePicture(response.data.data.profilePicture);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePicture();
  }, []);

  const handleProfilePictureSuccess = (newProfilePicture: string) => {
    setProfilePicture(newProfilePicture);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your profile picture...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Profile Picture</h1>
        <p className="text-muted-foreground">Upload and manage your profile picture</p>
      </div>

      {/* Current Profile Picture */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Current Profile Picture</CardTitle>
          <CardDescription>This is how your profile picture appears to others</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <ProfilePictureDisplay
              profilePicture={profilePicture}
              name={user?.name || undefined}
              size="xl"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold">{user?.name || 'User'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Camera className="h-5 w-5" />
            Upload New Picture
          </CardTitle>
          <CardDescription>
            Choose a new profile picture. It will be automatically resized to 180x180 pixels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload
            currentProfilePicture={profilePicture}
            onUploadSuccess={handleProfilePictureSuccess}
            size="lg"
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {profilePicture && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = 'image/*';
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // Trigger the upload component's file selection
                      const uploadComponent = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (uploadComponent) {
                        uploadComponent.click();
                      }
                    }
                  };
                  fileInput.click();
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Change Picture
              </Button>
              
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await axiosInstance.delete('/profile-picture');
                    setProfilePicture(null);
                  } catch (error) {
                    console.error('Error removing profile picture:', error);
                  }
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove Picture
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
