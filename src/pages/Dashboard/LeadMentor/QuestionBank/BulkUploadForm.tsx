import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { bulkUploadService, type BulkQuestionData } from '@/api/questionBankService';
import { toast } from 'sonner';

interface BulkUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BulkUploadForm: React.FC<BulkUploadFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<BulkQuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadResults, setUploadResults] = useState<{
    saved: number;
    errors: number;
    errorDetails: any[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedQuestions([]);
      setErrors([]);
      setUploadResults(null);
    }
  };

  const handleParseFile = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      const response = await bulkUploadService.parseFile(file);
      if (response.success) {
        setParsedQuestions(response.data.questions);
        setErrors([]);
        toast.success(`Successfully parsed ${response.data.total} questions`);
      }
    } catch (error: any) {
      console.error('Error parsing file:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to upload');
      return;
    }

    try {
      setUploading(true);
      const response = await bulkUploadService.saveBulkQuestions(parsedQuestions);
      if (response.success) {
        setUploadResults(response.data);
        toast.success(`Successfully uploaded ${response.data.saved} questions`);
        if (response.data.errors > 0) {
          toast.warning(`${response.data.errors} questions had errors`);
        }
      }
    } catch (error: any) {
      console.error('Error uploading questions:', error);
      toast.error(error.response?.data?.message || 'Failed to upload questions');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedQuestions([]);
    setErrors([]);
    setUploadResults(null);
    onOpenChange(false);
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const headers = [
      'Question Text',
      'Grade',
      'Subject',
      'Module',
      'Answer Type',
      'Answer Choice 1',
      'Answer Choice 2',
      'Answer Choice 3',
      'Answer Choice 4',
      'Answer Choice 5',
      'Answer Choice 6',
      'Answer Choice 7',
      'Answer Choice 8',
      'Answer Choice 9',
      'Answer Choice 10',
      'Correct Answer(s)',
      'Difficulty',
      'Explanation'
    ];

    const sampleData = [
      [
        'What is the capital of India?',
        'Grade 5',
        'Geography',
        'Indian Geography',
        'radio',
        'Mumbai',
        'Delhi',
        'Kolkata',
        'Chennai',
        '',
        '',
        '',
        '',
        '',
        '',
        '2',
        'Easy',
        'Delhi is the capital of India and serves as the seat of the Government of India.'
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Upload questions in bulk using Excel (.xlsx, .xls) or CSV format.</p>
                <p className="mb-2">Required columns:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Question Text</li>
                  <li>Grade (Grade 1 - Grade 10)</li>
                  <li>Subject</li>
                  <li>Module</li>
                  <li>Answer Type (radio, checkbox)</li>
                  <li>Answer Choice 1, Answer Choice 2 (minimum required)</li>
                  <li>Answer Choice 3, Answer Choice 4, ... (optional, up to 15 total)</li>
                  <li>Correct Answer(s) (comma-separated indices, e.g., "1,3" for choices 1 and 3)</li>
                  <li>Difficulty (Easy, Medium, Tough)</li>
                  <li>Explanation (optional explanation for the correct answer)</li>
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                {file && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <Button
                onClick={handleParseFile}
                disabled={!file || loading}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {loading ? 'Parsing...' : 'Parse File'}
              </Button>
            </CardContent>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="text-red-800">
                  <p className="font-medium mb-2">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Parsed Questions Preview */}
          {parsedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Parsed Questions ({parsedQuestions.length})
                  <Button
                    onClick={handleUploadQuestions}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Questions'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Choices</TableHead>
                        <TableHead>Correct</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedQuestions.map((question, index) => (
                        <TableRow key={index}>
                          <TableCell>{question.row}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={question.questionText}>
                              {question.questionText}
                            </div>
                          </TableCell>
                          <TableCell>{question.grade}</TableCell>
                          <TableCell>{question.subject}</TableCell>
                          <TableCell>{question.module}</TableCell>
                          <TableCell>{question.answerType}</TableCell>
                          <TableCell>
                            <Badge className={
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>{question.answerChoices.length}</TableCell>
                          <TableCell>
                            {question.correctAnswers.map(idx => idx + 1).join(', ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResults.errors > 0 ? (
                    <XCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Successfully Uploaded</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">{uploadResults.saved}</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Errors</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-1">{uploadResults.errors}</p>
                  </div>
                </div>

                {uploadResults.errorDetails.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Error Details:</h4>
                    <div className="space-y-2">
                      {uploadResults.errorDetails.map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <span className="font-medium">Row {error.row}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  {uploadResults.saved > 0 && (
                    <Button onClick={handleSuccess}>
                      View Questions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          {!uploadResults && (
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadForm;
