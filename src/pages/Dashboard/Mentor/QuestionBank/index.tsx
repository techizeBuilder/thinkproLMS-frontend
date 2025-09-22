import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  questionBankService,
  type Question,
  type QuestionFilters,
} from "@/api/questionBankService";
import { subjectService, type Subject } from '@/api/subjectService';
import { moduleService, type ModuleItem } from '@/api/moduleService';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import RecommendQuestionForm from "./RecommendQuestionForm";

const MentorQuestionBankPage: React.FC = () => {
  const { } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grades = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ];

  const difficulties = ["Easy", "Medium", "Tough"];
  const answerTypes = ["radio", "checkbox", "dropdown", "multichoice"];

  useEffect(() => {
    fetchQuestions();
    fetchSubjectsAndModules();
  }, [filters]);

  useEffect(() => {
    if (filters.grade && filters.subject) {
      fetchModulesForSubject();
    } else {
      setModules([]);
    }
  }, [filters.grade, filters.subject]);

  const fetchModulesForSubject = async () => {
    if (!filters.grade || !filters.subject) return;
    
    try {
      const gradeNumber = parseInt(filters.grade.replace('Grade ', ''));
      const selectedSubject = subjects.find(s => s.name === filters.subject);
      
      if (selectedSubject) {
        const moduleData = await moduleService.getModulesByGradeAndSubject(gradeNumber, selectedSubject._id);
        setModules(moduleData.modules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionBankService.getQuestions(filters);
      if (response.success) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        setError("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsAndModules = async () => {
    try {
      const response = await questionBankService.getSubjectsAndModules(filters.grade);
      if (response.success) {
        setSubjects(response.data.subjects);
        setModules(response.data.modules);
      }
    } catch (error) {
      console.error("Error fetching subjects and modules:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRecommendSuccess = () => {
    setShowRecommendForm(false);
    toast.success("Question recommendation submitted successfully!");
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const getAnswerTypeLabel = (type: string) => {
    switch (type) {
      case "radio":
        return "Single Choice";
      case "checkbox":
        return "Multiple Choice";
      case "dropdown":
        return "Dropdown";
      case "multichoice":
        return "Multi Choice";
      default:
        return type;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-gray-600">
            View and recommend questions for the question bank
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRecommendForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Recommend Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Grade</label>
              <Select
                value={filters.grade || "all"}
                onValueChange={(value) => handleFilterChange("grade", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select
                value={filters.subject || "all"}
                onValueChange={(value) => handleFilterChange("subject", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Module</label>
              <Select
                value={filters.module || "all"}
                onValueChange={(value) => handleFilterChange("module", value)}
                disabled={!filters.grade || !filters.subject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module._id} value={module.name}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) => handleFilterChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Answer Type</label>
              <Select
                value={filters.answerType || "all"}
                onValueChange={(value) => handleFilterChange("answerType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {answerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getAnswerTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search questions..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading questions...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">No questions found</div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question._id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={question.questionText}>
                          {question.questionText}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.grade}</Badge>
                      </TableCell>
                      <TableCell>{question.subject}</TableCell>
                      <TableCell>{question.module}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            question.difficulty === "Easy"
                              ? "default"
                              : question.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAnswerTypeLabel(question.answerType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {question.createdBy?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewQuestion(question)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommend Question Form */}
      {showRecommendForm && (
        <RecommendQuestionForm
          open={showRecommendForm}
          onOpenChange={setShowRecommendForm}
          onSuccess={handleRecommendSuccess}
        />
      )}

      {/* View Question Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="space-y-6">
              {/* Question Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Grade</label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedQuestion.grade}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <div className="mt-1 text-sm">{selectedQuestion.subject}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Module</label>
                  <div className="mt-1 text-sm">{selectedQuestion.module}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Difficulty</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedQuestion.difficulty === "Easy"
                          ? "default"
                          : selectedQuestion.difficulty === "Medium"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Answer Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {getAnswerTypeLabel(selectedQuestion.answerType)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="text-sm font-medium text-gray-500">Question</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedQuestion.questionText}</p>
                </div>
              </div>

              {/* Answer Choices */}
              <div>
                <label className="text-sm font-medium text-gray-500">Answer Choices</label>
                <div className="mt-1 space-y-2">
                  {selectedQuestion.answerChoices.map((choice, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        selectedQuestion.correctAnswers.includes(index)
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-sm">{choice.text}</span>
                        {selectedQuestion.correctAnswers.includes(index) && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Correct
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <div className="mt-1 text-sm">{selectedQuestion.createdBy?.name || "Unknown"}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorQuestionBankPage;
