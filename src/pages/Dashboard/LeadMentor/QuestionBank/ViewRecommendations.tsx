import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, ArrowLeft, CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { questionRecommendationService, questionBankService, type QuestionRecommendation, type RecommendationFilters } from '@/api/questionBankService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ViewRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Determine the base route based on user role
  const getBaseRoute = () => {
    if (user?.role === 'superadmin') return '/superadmin';
    if (user?.role === 'leadmentor') return '/leadmentor';
    return '/leadmentor'; // fallback
  };
  const [recommendations, setRecommendations] = useState<QuestionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    status: 'all',
    difficulty: 'all',
    session: 'all',
  });
  const [sessions, setSessions] = useState<Array<{
    _id: string;
    name: string;
    grade: number;
    sessionNumber: number;
    displayName?: string;
    module: {
      _id: string;
      name: string;
    };
  }>>([]);
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<QuestionRecommendation | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');

  const difficulties = ['Easy', 'Medium', 'Tough'];
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
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
      const response = await questionRecommendationService.getRecommendations(filters);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleFilterChange = (key: keyof RecommendationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleViewRecommendation = (recommendation: QuestionRecommendation) => {
    setSelectedRecommendation(recommendation);
    setShowViewDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedRecommendation) return;

    try {
      await questionRecommendationService.approveRecommendation(selectedRecommendation._id, {
        reviewComments: reviewComments,
      });
      toast.success('Recommendation approved successfully');
      setShowApproveDialog(false);
      setShowViewDialog(false);
      fetchRecommendations();
    } catch (error: any) {
      console.error('Error approving recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to approve recommendation');
    }
  };

  const handleReject = async () => {
    if (!selectedRecommendation) return;

    try {
      await questionRecommendationService.rejectRecommendation(selectedRecommendation._id, {
        reviewComments: reviewComments,
      });
      toast.success('Recommendation rejected successfully');
      setShowRejectDialog(false);
      setShowViewDialog(false);
      fetchRecommendations();
    } catch (error: any) {
      console.error('Error rejecting recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to reject recommendation');
    }
  };

  const selectedSession = sessions.find(s => s._id === filters.session);

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
          <h1 className="text-2xl md:text-3xl font-bold">View Recommendations</h1>
          <p className="text-gray-600">Review and manage question recommendations</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="mt-1">
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

            <div>
              <Label className="text-sm font-medium">Difficulty</Label>
              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) => handleFilterChange("difficulty", value)}
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
              <Label className="text-sm font-medium">Session</Label>
              <Popover open={sessionSelectOpen} onOpenChange={setSessionSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sessionSelectOpen}
                    className="w-full justify-between mt-1"
                  >
                    {selectedSession ? selectedSession.displayName || selectedSession.name : "All Sessions"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sessions..." />
                    <CommandEmpty>No session found.</CommandEmpty>
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
                            filters.session === "all" ? "opacity-100" : "opacity-0"
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
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              filters.session === session._id ? "opacity-100" : "opacity-0"
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
      <Card>
        <CardHeader>
          <CardTitle>Question Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommendations found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-2 line-clamp-2">
                            {recommendation.questionText}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(recommendation.difficulty)}>
                              {recommendation.difficulty}
                            </Badge>
                            <Badge className={getStatusColor(recommendation.status)}>
                              {recommendation.status}
                            </Badge>
                            <Badge variant="outline">
                              {getAnswerTypeLabel(recommendation.answerType)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Recommended by: {recommendation.recommendedBy.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRecommendation(recommendation)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Recommendation Dialog */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Question Recommendation</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                >
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <Badge className={getDifficultyColor(selectedRecommendation.difficulty)}>
                      {selectedRecommendation.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Answer Type</Label>
                    <Badge variant="outline">
                      {getAnswerTypeLabel(selectedRecommendation.answerType)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Answer Choices</Label>
                  <div className="mt-1 space-y-2">
                    {selectedRecommendation.answerChoices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span className="text-sm flex-1">{choice.text}</span>
                        {choice.isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Recommended by</Label>
                    <p className="text-sm mt-1">{selectedRecommendation.recommendedBy.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedRecommendation.status)}>
                      {selectedRecommendation.status}
                    </Badge>
                  </div>
                </div>

                {selectedRecommendation.reviewComments && (
                  <div>
                    <Label className="text-sm font-medium">Review Comments</Label>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                      {selectedRecommendation.reviewComments}
                    </p>
                  </div>
                )}

                {selectedRecommendation.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setShowApproveDialog(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)}
                      className="text-red-600 hover:text-red-700"
                    >
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
              <Label htmlFor="approveComments">Review Comments (Optional)</Label>
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
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewRecommendationsPage;
