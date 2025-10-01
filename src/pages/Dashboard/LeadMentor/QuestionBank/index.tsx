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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  questionBankService,
  type Question,
  type QuestionFilters,
} from "@/api/questionBankService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CreateQuestionForm from "./CreateQuestionForm";
import EditQuestionForm from "./EditQuestionForm";
import BulkUploadForm from "./BulkUploadForm";
import QuestionRecommendations from "./QuestionRecommendations";

const QuestionBankPage: React.FC = () => {
  const { } = useAuth();
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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
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

  const handleDeleteQuestion = async (id: string) => {
    try {
      const response = await questionBankService.deleteQuestion(id);
      if (response.success) {
        toast.success("Question deleted successfully");
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleReorderQuestion = async (
    questionId: string,
    direction: "up" | "down"
  ) => {
    try {
      const questionIndex = questions.findIndex((q) => q._id === questionId);
      if (questionIndex === -1) return;

      const newIndex =
        direction === "up" ? questionIndex - 1 : questionIndex + 1;
      if (newIndex < 0 || newIndex >= questions.length) return;

      const questionOrders = questions.map((q, index) => ({
        id: q._id,
        order:
          index === questionIndex
            ? newIndex + 1
            : index === newIndex
            ? questionIndex + 1
            : index + 1,
      }));

      const response = await questionBankService.reorderQuestions(
        questionOrders
      );
      if (response.success) {
        toast.success("Question reordered successfully");
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error reordering question:", error);
      toast.error("Failed to reorder question");
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-gray-600">
            Manage assessment questions for all schools
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRecommendations(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Recommendations
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search questions..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Session</label>
              <Popover open={sessionSelectOpen} onOpenChange={setSessionSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sessionSelectOpen}
                    className="w-full justify-between mt-1"
                  >
                    {filters.session
                      ? sessions.find((session) => session._id === filters.session)?.displayName ||
                        `${sessions.find((session) => session._id === filters.session)?.grade}.${sessions.find((session) => session._id === filters.session)?.sessionNumber?.toString().padStart(2, '0')} ${sessions.find((session) => session._id === filters.session)?.name}`
                      : "All Sessions"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                              <span className="font-medium">
                                {session.displayName || `${session.grade}.${session.sessionNumber?.toString().padStart(2, '0')} ${session.name}`}
                              </span>
                              <span className="text-sm text-gray-500">{session.module.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) =>
                  handleFilterChange("difficulty", value)
                }
              >
                <SelectTrigger className="mt-1">
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
            <div>
              <label className="text-sm font-medium">Answer Type</label>
              <Select
                value={filters.answerType || "all"}
                onValueChange={(value) =>
                  handleFilterChange("answerType", value)
                }
              >
                <SelectTrigger className="mt-1">
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
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">Error: {error}</div>
              <Button onClick={fetchQuestions} variant="outline">
                Retry
              </Button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question._id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleReorderQuestion(question._id, "up")
                            }
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="font-medium">{question.order}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleReorderQuestion(question._id, "down")
                            }
                            disabled={index === questions.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={question.questionText}>
                          {question.questionText}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {question.session?.displayName || `${question.session?.grade}.${question.session?.sessionNumber?.toString().padStart(2, '0')} ${question.session?.name}`}
                          </div>
                          <div className="text-gray-500">
                            {question.session?.module?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAnswerTypeLabel(question.answerType)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getDifficultyColor(question.difficulty)}
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {question.approvedBy ? (
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuestion(question);
                              setShowEditForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Question
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteQuestion(question._id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Modals */}
      <CreateQuestionForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => {
          setShowCreateForm(false);
          fetchQuestions();
        }}
      />

      <EditQuestionForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        question={selectedQuestion}
        onSuccess={() => {
          setShowEditForm(false);
          setSelectedQuestion(null);
          fetchQuestions();
        }}
      />

      <BulkUploadForm
        open={showBulkUpload}
        onOpenChange={setShowBulkUpload}
        onSuccess={() => {
          setShowBulkUpload(false);
          fetchQuestions();
        }}
      />

      <QuestionRecommendations
        open={showRecommendations}
        onOpenChange={setShowRecommendations}
        onSuccess={() => {
          fetchQuestions();
        }}
      />

    </div>
  );
};

export default QuestionBankPage;
