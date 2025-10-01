import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { questionRecommendationService, questionBankService, type QuestionRecommendation, type RecommendationFilters } from '@/api/questionBankService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QuestionRecommendationsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const QuestionRecommendations: React.FC<QuestionRecommendationsProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { } = useAuth();
  const [recommendations, setRecommendations] = useState<QuestionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    status: 'pending',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<QuestionRecommendation | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
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

  const statuses = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  useEffect(() => {
    if (open) {
      fetchRecommendations();
      fetchSessions();
    }
  }, [open, filters]);

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await questionRecommendationService.getRecommendations(filters);
      if (response.success) {
        setRecommendations(response.data.recommendations);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
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

  const handleReviewRecommendation = async (status: 'approved' | 'rejected') => {
    if (!selectedRecommendation) return;

    try {
      setReviewLoading(true);
      const response = await questionRecommendationService.reviewRecommendation(
        selectedRecommendation._id,
        status,
        reviewComments
      );
      if (response.success) {
        toast.success(`Question recommendation ${status} successfully`);
        setShowReviewDialog(false);
        setSelectedRecommendation(null);
        setReviewComments('');
        fetchRecommendations();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error reviewing recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to review recommendation');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Tough': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Question Recommendations</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          ? sessions.find(session => session._id === filters.session)?.displayName || 
                            sessions.find(session => session._id === filters.session)?.name
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
                                handleFilterChange('session', '');
                                setSessionSelectOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  !filters.session ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              All Sessions
                            </CommandItem>
                            {sessions.map((session) => (
                              <CommandItem
                                key={session._id}
                                value={session.name}
                                onSelect={() => {
                                  handleFilterChange('session', session._id);
                                  setSessionSelectOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    filters.session === session._id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {session.displayName || `${session.name} (Grade ${session.grade}, Session ${session.sessionNumber})`}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
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
              <CardTitle>Recommendations ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading recommendations...</div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recommendations found</div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Recommended By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.map((recommendation) => (
                        <TableRow key={recommendation._id}>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={recommendation.questionText}>
                              {recommendation.questionText}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {recommendation.session?.displayName || recommendation.session?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Grade {recommendation.session?.grade} • Session {recommendation.session?.sessionNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {recommendation.session?.module?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getDifficultyColor(recommendation.difficulty)}>
                              {recommendation.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{recommendation.recommendedBy.name}</div>
                              <div className="text-sm text-gray-500">{recommendation.recommendedBy.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(recommendation.status)}>
                              {getStatusIcon(recommendation.status)}
                              <span className="ml-1 capitalize">{recommendation.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRecommendation(recommendation);
                                  setShowReviewDialog(true);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                Review
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
        </div>

        {/* Review Dialog */}
        <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Review Question Recommendation</AlertDialogTitle>
            </AlertDialogHeader>
            
            {selectedRecommendation && (
              <div className="space-y-6">
                {/* Question Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Question Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-medium">Question Text:</Label>
                      <p className="mt-1 p-3 bg-gray-50 rounded border">
                        {selectedRecommendation.questionText}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium">Session:</Label>
                        <div className="mt-1 space-y-1">
                          <p className="font-medium">
                            {selectedRecommendation.session?.displayName || selectedRecommendation.session?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Grade {selectedRecommendation.session?.grade} • Session {selectedRecommendation.session?.sessionNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Module: {selectedRecommendation.session?.module?.name}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="font-medium">Difficulty:</Label>
                        <div className="mt-1">
                          <Badge className={getDifficultyColor(selectedRecommendation.difficulty)}>
                            {selectedRecommendation.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium">Answer Choices:</Label>
                      <div className="mt-2 space-y-2">
                        {selectedRecommendation.answerChoices.map((choice, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <span className="font-medium w-8">{index + 1}.</span>
                            <span className="flex-1">{choice.text}</span>
                            {selectedRecommendation.correctAnswers.includes(index) && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Correct
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium">Recommended By:</Label>
                      <p>{selectedRecommendation.recommendedBy.name} ({selectedRecommendation.recommendedBy.email})</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Comments */}
                <div>
                  <Label htmlFor="reviewComments">Review Comments (Optional)</Label>
                  <Textarea
                    id="reviewComments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add any comments about this recommendation..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setShowReviewDialog(false);
                    setSelectedRecommendation(null);
                    setReviewComments('');
                  }}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleReviewRecommendation('rejected')}
                    disabled={reviewLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {reviewLoading ? 'Rejecting...' : 'Reject'}
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => handleReviewRecommendation('approved')}
                    disabled={reviewLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {reviewLoading ? 'Approving...' : 'Approve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionRecommendations;
