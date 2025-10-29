import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { bulkUploadService, type BulkQuestionData } from '@/api/questionBankService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine the base route based on user role
  const getBaseRoute = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/leadmentor'; // fallback
  };
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

  const downloadTemplate = () => {
    // Create sample data for Excel template
    const data = [
      ['Question Text', 'Session ID', 'Answer Type', 'Answer Choice 1', 'Answer Choice 2', 'Answer Choice 3', 'Answer Choice 4', 'Answer Choice 5', 'Answer Choice 6', 'Answer Choice 7', 'Answer Choice 8', 'Answer Choice 9', 'Answer Choice 10', 'Correct Answer(s)', 'Difficulty', 'Explanation'],
      ['What is the capital of India?', '507f1f77bcf86cd799439011', 'radio', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai', '', '', '', '', '', '', '2', 'Easy', 'Delhi is the capital of India and serves as the seat of the Government of India.'],
      ['Which of the following are programming languages?', '507f1f77bcf86cd799439012', 'checkbox', 'Python', 'HTML', 'JavaScript', 'CSS', 'Java', '', '', '', '', '', '1,3,5', 'Medium', 'Python, JavaScript, and Java are programming languages. HTML and CSS are markup and styling languages respectively.']
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Question Bank Template');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_bank_template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${getBaseRoute()}/question-bank`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Question Bank
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Bulk Upload Questions</h1>
          <p className="text-gray-600">Upload multiple questions at once using Excel/CSV files</p>
        </div>
      </div>

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
            <div className="space-y-2">
              <h4 className="font-medium">File Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>File must be in Excel (.xlsx) or CSV format</li>
                <li>First row must contain column headers</li>
                <li>Required columns: Question Text, Session ID, Answer Type, Answer Choice 1, Answer Choice 2, Correct Answer(s), Difficulty</li>
                <li>Optional columns: Answer Choice 3-10, Explanation</li>
                <li>Answer Type: "radio" for single choice, "checkbox" for multiple choice</li>
                <li>Correct Answer(s): Comma-separated numbers (e.g., "2" for single choice, "1,3,5" for multiple choice)</li>
                <li>Difficulty: "Easy", "Medium", or "Tough"</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <p className="text-sm text-gray-600">
                Use the template to ensure proper formatting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file">Select Excel/CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            {file && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
                <Button
                  onClick={handleParseFile}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {loading ? 'Parsing...' : 'Parse File'}
                </Button>
              </div>
            )}

            {errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">File parsing errors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Parsed Questions Preview */}
        {parsedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Parsed Questions ({parsedQuestions.length})</span>
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
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Choices</TableHead>
                        <TableHead>Correct</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedQuestions.slice(0, 10).map((question, index) => (
                        <TableRow key={index}>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {question.questionText}
                            </div>
                          </TableCell>
                          <TableCell>{question.session}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {question.answerType === 'radio' ? 'Single right answer' : 'Multiple right answers'}
                            </Badge>
                          </TableCell>
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
                          <TableCell>{question.correctAnswers.join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {parsedQuestions.length > 10 && (
                  <p className="text-sm text-gray-600 text-center">
                    Showing first 10 questions. Total: {parsedQuestions.length} questions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResults.errors === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Successfully uploaded: {uploadResults.saved}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Errors: {uploadResults.errors}</span>
                </div>
              </div>

              {uploadResults.errorDetails.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Error Details:</h4>
                  <div className="space-y-2">
                    {uploadResults.errorDetails.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 rounded text-sm">
                        <strong>Row {error.row}:</strong> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`${getBaseRoute()}/question-bank`)}
                  className="flex items-center gap-2"
                >
                  View Question Bank
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setParsedQuestions([]);
                    setErrors([]);
                    setUploadResults(null);
                  }}
                >
                  Upload Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulkUploadPage;
