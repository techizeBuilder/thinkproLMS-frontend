import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, Image, Video, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fileUploadService } from '@/api/fileUploadService';

interface UploadResult {
  success: boolean;
  data?: any;
  message?: string;
}

export default function FileUploadTest() {
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // File refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const multipleInputRef = useRef<HTMLInputElement>(null);

  const addResult = (result: UploadResult) => {
    setUploadResults(prev => [result, ...prev]);
  };

  const handleUpload = async (uploadFunction: () => Promise<any>, type: string) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadFunction();
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      addResult({
        success: true,
        data: result,
        message: `${type} uploaded successfully!`
      });
    } catch (error: any) {
      addResult({
        success: false,
        message: `Failed to upload ${type}: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleVideoUpload = async () => {
    const file = videoInputRef.current?.files?.[0];
    if (!file) {
      addResult({ success: false, message: 'Please select a video file' });
      return;
    }
    
    await handleUpload(() => fileUploadService.testUploadVideo(file), 'Video');
  };

  const handleImageUpload = async () => {
    const file = imageInputRef.current?.files?.[0];
    if (!file) {
      addResult({ success: false, message: 'Please select an image file' });
      return;
    }
    
    await handleUpload(() => fileUploadService.testUploadImage(file), 'Image');
  };

  const handleDocumentUpload = async () => {
    const file = documentInputRef.current?.files?.[0];
    if (!file) {
      addResult({ success: false, message: 'Please select a document file' });
      return;
    }
    
    await handleUpload(() => fileUploadService.testUploadDocument(file), 'Document');
  };

  const handleMultipleUpload = async () => {
    const files = multipleInputRef.current?.files;
    if (!files || files.length === 0) {
      addResult({ success: false, message: 'Please select files' });
      return;
    }
    
    const fileArray = Array.from(files);
    await handleUpload(() => fileUploadService.testUploadMultiple(fileArray), `${fileArray.length} Files`);
  };

  const handleDirectUpload = async () => {
    const file = documentInputRef.current?.files?.[0];
    if (!file) {
      addResult({ success: false, message: 'Please select a file for direct upload' });
      return;
    }
    
    await handleUpload(() => fileUploadService.testDirectUpload(file), 'Direct Upload');
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">File Upload Test</h1>
        <p className="text-gray-600">Test AWS S3 file upload functionality</p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Upload
            </CardTitle>
            <CardDescription>
              Upload video files (MP4, WebM, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video">Select Video File</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                ref={videoInputRef}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleVideoUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Video
            </Button>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Upload
            </CardTitle>
            <CardDescription>
              Upload image files (JPEG, PNG, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="image">Select Image File</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={imageInputRef}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleImageUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Image
            </Button>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload documents (PDF, Word, Excel, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document">Select Document File</Label>
              <Input
                id="document"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
                ref={documentInputRef}
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleDocumentUpload} 
                disabled={uploading}
                className="w-full"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload Document
              </Button>
              <Button 
                onClick={handleDirectUpload} 
                disabled={uploading}
                variant="outline"
                className="w-full"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <File className="h-4 w-4" />}
                Direct Upload (S3)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Multiple Files Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Multiple Files
            </CardTitle>
            <CardDescription>
              Upload multiple files at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="multiple">Select Multiple Files</Label>
              <Input
                id="multiple"
                type="file"
                multiple
                ref={multipleInputRef}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleMultipleUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Multiple Files
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upload Results</CardTitle>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No uploads yet. Try uploading a file above.</p>
          ) : (
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {result.message}
                      {result.data && (
                        <div className="mt-2 text-xs">
                          <pre className="bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
