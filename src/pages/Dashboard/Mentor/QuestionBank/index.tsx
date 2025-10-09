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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import RecommendQuestionForm from "./RecommendQuestionForm";

const MentorQuestionBankPage: React.FC = () => {
  const {} = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 10,
  });
  const [sessions, setSessions] = useState<{
    _id: string;
    name: string;
    grade: number;
    sessionNumber: number;
    displayName?: string;
    module: {
      _id: string;
      name: string;
    };
  }[]>([]);
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [showRecommendForm, setShowRecommendForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficulties = ["Easy", "Medium", "Tough"];
  const answerTypes = ["radio", "checkbox"];

  useEffect(() => {
    fetchQuestions();
    fetchSessions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching questions with filters:", filters);
      const response = await questionBankService.getQuestions(filters);
      console.log("Questions response:", response);
      if (response.success) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      } else {
        console.error("API returned success: false", response);
        const errorMsg = response.message || "Failed to fetch questions";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to fetch questions";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: 1, // Reset to first page when filtering
      };
      
      return newFilters;
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRecommendSuccess = () => {
    setShowRecommendForm(false);
    toast.success("Question recommendation submitted successfully!");
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowViewDialog(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Tough":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Question Bank</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            View and recommend questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRecommendForm(true)}
            className="flex items-center gap-1 md:gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            Recommend
          </Button>
        </div>
      </div>

      {/* Filters - Outside card for minimal padding */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-2">
            <div className="flex-shrink-0 w-48 sm:w-56">
              <label className="text-xs font-medium">Search</label>
              <Input
                placeholder="Search..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="mt-1 text-xs sm:text-sm h-8 sm:h-9"
              />
            </div>
            <div className="flex-shrink-0 w-48 sm:w-56">
              <label className="text-xs font-medium">Session</label>
              <Popover open={sessionSelectOpen} onOpenChange={setSessionSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sessionSelectOpen}
                    className="w-full justify-between mt-1 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <span className="truncate">
                      {filters.session
                        ? sessions.find((session) => session._id === filters.session)?.displayName ||
                          `${sessions.find((session) => session._id === filters.session)?.grade}.${sessions.find((session) => session._id === filters.session)?.sessionNumber?.toString().padStart(2, '0')} ${sessions.find((session) => session._id === filters.session)?.name}`
                        : "All Sessions"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sessions..." />
                    <CommandList>
                      <CommandEmpty>No sessions found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            handleFilterChange("session", "all");
                            setSessionSelectOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              !filters.session || filters.session === "all" ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          All Sessions
                        </CommandItem>
                        {sessions.map((session) => (
                          <CommandItem
                            key={session._id}
                            value={`${session.displayName || `${session.grade}.${session.sessionNumber?.toString().padStart(2, '0')} ${session.name}`} ${session.module.name}`}
                            onSelect={() => {
                              handleFilterChange("session", session._id);
                              setSessionSelectOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                filters.session === session._id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {session.displayName || `${session.grade}.${session.sessionNumber?.toString().padStart(2, '0')} ${session.name}`}
                              </span>
                              <span className="text-xs text-gray-500">{session.module.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-shrink-0 w-32 sm:w-36">
              <label className="text-xs font-medium">Difficulty</label>
              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) =>
                  handleFilterChange("difficulty", value)
                }
              >
                <SelectTrigger className="mt-1 text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="All Difficulties" />
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
            <div className="flex-shrink-0 w-32 sm:w-36">
              <label className="text-xs font-medium">Answer Type</label>
              <Select
                value={filters.answerType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("answerType", value)
                }
              >
                <SelectTrigger className="mt-1 text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="All Types" />
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
          </div>
        </div>
      </div>

      {/* Questions Table - Responsive with horizontal scroll */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg md:text-xl">Questions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-6 md:py-8 text-xs sm:text-sm">Loading questions...</div>
          ) : error ? (
            <div className="text-center py-6 md:py-8">
              <div className="text-red-600 mb-3 md:mb-4 text-xs sm:text-sm">Error: {error}</div>
              <Button onClick={fetchQuestions} variant="outline" className="text-xs sm:text-sm">
                Retry
              </Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-6 md:py-8 text-gray-500 text-xs sm:text-sm">
              No questions found
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="min-w-full px-2 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm min-w-[200px] sm:min-w-[250px]">Question</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell min-w-[120px]">Session</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell min-w-[80px]">Difficulty</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell min-w-[100px]">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question._id}>
                          <TableCell className="min-w-[200px] sm:min-w-[250px]">
                            <div className="space-y-1">
                              <div className="text-xs sm:text-sm line-clamp-2" title={question.questionText}>
                                {question.questionText}
                              </div>
                              <div className="flex gap-1 flex-wrap sm:hidden">
                                <Badge className={`${getDifficultyColor(question.difficulty)} text-[10px] px-1 py-0`}>
                                  {question.difficulty}
                                </Badge>
                                {question.approvedBy ? (
                                  <Badge className="bg-green-100 text-green-800 text-[10px] px-1 py-0">
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-[10px] px-1 py-0">
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 sm:hidden">
                                {question.session?.displayName || `${question.session?.grade}.${question.session?.sessionNumber?.toString().padStart(2, '0')}`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell min-w-[120px]">
                            <div className="text-xs sm:text-sm">
                              <div className="font-medium truncate">
                                {question.session?.displayName || `${question.session?.grade}.${question.session?.sessionNumber?.toString().padStart(2, '0')}`}
                              </div>
                              <div className="text-gray-500 truncate text-xs">
                                {question.session?.module?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell min-w-[80px]">
                            <Badge
                              className={`${getDifficultyColor(question.difficulty)} text-xs`}
                            >
                              {question.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell min-w-[100px]">
                            {question.approvedBy ? (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewQuestion(question)}
                              className="flex items-center gap-1 text-xs sm:text-sm h-6 sm:h-7 md:h-8 px-1 sm:px-2 md:px-3"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                  >
                    Previous
                  </Button>
                  <span className="text-xs sm:text-sm px-2">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
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
                  <label className="text-sm font-medium text-gray-500">
                    Session
                  </label>
                  <div className="mt-1">
                    <div className="text-sm font-medium">
                      {selectedQuestion.session?.displayName || `${selectedQuestion.session?.grade}.${selectedQuestion.session?.sessionNumber?.toString().padStart(2, '0')} ${selectedQuestion.session?.name}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedQuestion.session?.module?.name}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Order
                  </label>
                  <div className="mt-1 text-sm">{selectedQuestion.order}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    {selectedQuestion.approvedBy ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Difficulty
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={getDifficultyColor(selectedQuestion.difficulty)}
                    >
                      {selectedQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Answer Type
                  </label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {getAnswerTypeLabel(selectedQuestion.answerType)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Question
                </label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedQuestion.questionText}</p>
                </div>
              </div>

              {/* Answer Choices */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Answer Choices
                </label>
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

              {/* Explanation */}
              {selectedQuestion.explanation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Explanation
                  </label>
                  <div className="mt-1 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm">{selectedQuestion.explanation}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created By
                  </label>
                  <div className="mt-1 text-sm">
                    {selectedQuestion.createdBy?.name || "Unknown"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created At
                  </label>
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
