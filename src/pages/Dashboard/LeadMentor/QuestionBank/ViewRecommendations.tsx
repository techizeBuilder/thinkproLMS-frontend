import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  questionRecommendationService,
  questionBankService,
  type QuestionRecommendation,
  type RecommendationFilters,
} from "@/api/questionBankService";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

const ViewRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { counts, refreshCounts } = useNotifications();

  // Determine the base route based on user role
  const getBaseRoute = () => {
    if (user?.role === "superadmin") return "/superadmin";
    if (user?.role === "leadmentor") return "/leadmentor";
    return "/leadmentor"; // fallback
  };
  const [recommendations, setRecommendations] = useState<
    QuestionRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    status: "all",
    session: "all",
  });
  const [sessions, setSessions] = useState<
    Array<{
      _id: string;
      name: string;
      grade: number;
      sessionNumber: number;
      displayName?: string;
      module: {
        _id: string;
        name: string;
      };
    }>
  >([]);
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<QuestionRecommendation | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState("");

  const statuses = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAnswerTypeLabel = (type: string) => {
    switch (type) {
      case "radio":
        return "Single right answer";
      case "checkbox":
        return "Multiple right answers";
      case "dropdown":
        return "Dropdown";
      case "multichoice":
        return "Multi Choice";
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchSessions();
  }, [filters]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await questionRecommendationService.getRecommendations(
        filters
      );
      setRecommendations(response.data.recommendations || []);

      // Refresh notification counts
      await refreshCounts();
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to fetch recommendations");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleFilterChange = (
    key: keyof RecommendationFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewRecommendation = (recommendation: QuestionRecommendation) => {
    setSelectedRecommendation(recommendation);
  };

  const handleApprove = async () => {
    if (!selectedRecommendation) return;

    try {
      await questionRecommendationService.approveRecommendation(
        selectedRecommendation._id,
        {
          reviewComments: reviewComments,
        }
      );
      toast.success("Recommendation approved successfully");
      setShowApproveDialog(false);
      setSelectedRecommendation(null);
      setReviewComments("");
      fetchRecommendations();
    } catch (error: any) {
      console.error("Error approving recommendation:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve recommendation"
      );
    }
  };

  const handleReject = async () => {
    if (!selectedRecommendation) return;

    try {
      await questionRecommendationService.rejectRecommendation(
        selectedRecommendation._id,
        {
          reviewComments: reviewComments,
        }
      );
      toast.success("Recommendation rejected successfully");
      setShowRejectDialog(false);
      setSelectedRecommendation(null);
      setReviewComments("");
      fetchRecommendations();
    } catch (error: any) {
      console.error("Error rejecting recommendation:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject recommendation"
      );
    }
  };

  const selectedSession = sessions.find((s) => s._id === filters.session);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`${getBaseRoute()}/question-bank`)}
          className="flex items-center gap-2 w-full sm:w-auto justify-center min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          Back to Question Bank
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              View Recommendations
            </h1>
            {counts.pendingRecommendations > 0 && (
              <Badge
                variant="default"
                className="text-xs px-2 py-1 flex-shrink-0">
                {counts.pendingRecommendations} new
              </Badge>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Review and manage question recommendations
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-0">
              <Label className="text-sm font-medium">Session</Label>
              <Popover
                open={sessionSelectOpen}
                onOpenChange={setSessionSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sessionSelectOpen}
                    className="w-full justify-between mt-1 min-h-[44px]">
                    <span className="truncate">
                      {selectedSession
                        ? selectedSession.displayName || selectedSession.name
                        : "All Sessions"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] sm:w-full p-0"
                  align="start">
                  <Command>
                    <CommandInput placeholder="Search sessions..." />
                    <CommandEmpty>No session found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          handleFilterChange("session", "all");
                          setSessionSelectOpen(false);
                        }}>
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            filters.session === "all"
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        All Sessions
                      </CommandItem>
                      {sessions.map((session) => (
                        <CommandItem
                          key={session._id}
                          value={session._id}
                          onSelect={() => {
                            handleFilterChange("session", session._id);
                            setSessionSelectOpen(false);
                          }}>
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              filters.session === session._id
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {session.displayName || session.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Question Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!Array.isArray(recommendations) ||
              recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommendations found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((recommendation) => {
                    // Highlight pending recommendations subtly
                    const isPending = recommendation.status === "pending";

                    return (
                      <div
                        key={recommendation._id}
                        className={`border rounded-lg p-3 sm:p-4 ${
                          isPending ? "bg-yellow-50 border-yellow-200" : ""
                        }`}>
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:justify-between">
                          <div className="flex-1 min-w-0 w-full">
                            <h3 className="font-medium text-sm mb-2 line-clamp-2 break-words">
                              {recommendation.questionText}
                            </h3>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge
                                className={getDifficultyColor(
                                  recommendation.difficulty
                                )}>
                                {recommendation.difficulty}
                              </Badge>
                              <Badge
                                className={getStatusColor(
                                  recommendation.status
                                )}>
                                {recommendation.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getAnswerTypeLabel(recommendation.answerType)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              Recommended by:{" "}
                              {recommendation.recommendedBy.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewRecommendation(recommendation)
                              }
                              className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Recommendation Dialog */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  Question Recommendation
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRecommendation(null);
                  }}
                  className="flex-shrink-0 min-h-[44px] sm:min-h-0">
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Question Text</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedRecommendation.questionText}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <div className="mt-1">
                      <Badge
                        className={getDifficultyColor(
                          selectedRecommendation.difficulty
                        )}>
                        {selectedRecommendation.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Answer Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {getAnswerTypeLabel(selectedRecommendation.answerType)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Answer Choices</Label>
                  <div className="mt-1 space-y-2">
                    {selectedRecommendation.answerChoices.map(
                      (choice, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="text-sm flex-1">{choice.text}</span>
                          {choice.isCorrect && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {selectedRecommendation.explanation && (
                  <div>
                    <Label className="text-sm font-medium">Explanation</Label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                      {selectedRecommendation.explanation}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Recommended by
                    </Label>
                    <p className="text-sm mt-1 break-words">
                      {selectedRecommendation.recommendedBy.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge
                        className={getStatusColor(
                          selectedRecommendation.status
                        )}>
                        {selectedRecommendation.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedRecommendation.reviewComments && (
                  <div>
                    <Label className="text-sm font-medium">
                      Review Comments
                    </Label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                      {selectedRecommendation.reviewComments}
                    </p>
                  </div>
                )}

                {selectedRecommendation.status === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                      onClick={() => setShowApproveDialog(true)}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto min-h-[44px]">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)}
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto min-h-[44px]">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Recommendation</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approveComments">
                Review Comments (Optional)
              </Label>
              <Textarea
                id="approveComments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Add any comments about this recommendation..."
                className="mt-1"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Recommendation</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectComments">Review Comments (Required)</Label>
              <Textarea
                id="rejectComments"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="mt-1"
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!reviewComments.trim()}
              className="bg-red-600 hover:bg-red-700">
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewRecommendationsPage;
