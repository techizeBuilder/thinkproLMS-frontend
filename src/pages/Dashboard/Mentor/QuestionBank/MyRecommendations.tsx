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
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, ArrowLeft, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { questionRecommendationService, questionBankService, type QuestionRecommendation, type RecommendationFilters } from '@/api/questionBankService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MyRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState<QuestionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    status: 'all',
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
  const [showReRecommendDialog, setShowReRecommendDialog] = useState(false);
  const [reRecommendData, setReRecommendData] = useState({
    questionText: '',
    session: '',
    answerType: 'radio' as 'radio' | 'checkbox',
    answerChoices: [{ text: '', isCorrect: false }],
    correctAnswers: [] as number[],
    explanation: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Tough',
  });

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
      const response = await questionRecommendationService.getMyRecommendations(filters);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to fetch recommendations');
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

  const handleReRecommend = (recommendation: QuestionRecommendation) => {
    setSelectedRecommendation(recommendation);
    setReRecommendData({
      questionText: recommendation.questionText,
      answerType: recommendation.answerType,
      answerChoices: recommendation.answerChoices.map(choice => ({
        text: choice.text,
        isCorrect: choice.isCorrect
      })),
      correctAnswers: recommendation.correctAnswers,
      explanation: recommendation.explanation,
      difficulty: recommendation.difficulty,
    });
    setShowReRecommendDialog(true);
  };

  const handleReRecommendSubmit = async () => {
    if (!selectedRecommendation) return;

    try {
      await questionRecommendationService.reRecommendQuestion(selectedRecommendation._id, reRecommendData);
      toast.success('Question re-recommended successfully');
      setShowReRecommendDialog(false);
      setShowViewDialog(false);
      fetchRecommendations();
      navigate('/mentor/question-bank');
    } catch (error: any) {
      console.error('Error re-recommending question:', error);
      toast.error(error.response?.data?.message || 'Failed to re-recommend question');
    }
  };

  const handleAnswerChoiceChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const newChoices = [...reRecommendData.answerChoices];
    
    if (field === 'isCorrect' && reRecommendData.answerType === 'radio') {
      // For radio buttons, only one can be selected at a time
      newChoices.forEach((choice, idx) => {
        choice.isCorrect = idx === index ? value : false;
      });
    } else {
      newChoices[index] = {
        ...newChoices[index],
        [field]: value,
      };
    }

    setReRecommendData(prev => ({
      ...prev,
      answerChoices: newChoices,
    }));

    // Update correct answers
    if (field === 'isCorrect') {
      const correctAnswers = newChoices
        .map((choice, idx) => choice.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);
      
      setReRecommendData(prev => ({
        ...prev,
        correctAnswers,
      }));
    }
  };

  const addAnswerChoice = () => {
    if (reRecommendData.answerChoices.length < 15) {
      setReRecommendData(prev => ({
        ...prev,
        answerChoices: [...prev.answerChoices, { text: '', isCorrect: false }],
      }));
    }
  };

  const removeAnswerChoice = (index: number) => {
    if (reRecommendData.answerChoices.length > 2) {
      const newChoices = reRecommendData.answerChoices.filter((_, i) => i !== index);
      setReRecommendData(prev => ({
        ...prev,
        answerChoices: newChoices,
      }));

      // Update correct answers
      const correctAnswers = newChoices
        .map((choice, idx) => choice.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);
      
      setReRecommendData(prev => ({
        ...prev,
        correctAnswers,
      }));
    }
  };

  const selectedSession = sessions.find(s => s._id === filters.session);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/mentor/question-bank')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Question Bank
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Recommendations</h1>
          <p className="text-gray-600">View and manage your question recommendations</p>
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
          <CardTitle>My Question Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {!Array.isArray(recommendations) || recommendations.length === 0 ? (
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
                            Submitted: {new Date(recommendation.createdAt).toLocaleDateString()}
                          </p>
                          {recommendation.status === 'rejected' && recommendation.reviewComments && (
                            <p className="text-xs text-red-600 mt-1">
                              Rejection reason: {recommendation.reviewComments}
                            </p>
                          )}
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
                          {recommendation.status === 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReRecommend(recommendation)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Re-recommend
                            </Button>
                          )}
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
                  onClick={() => {
                    setShowViewDialog(false);
                    navigate('/mentor/question-bank');
                  }}
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
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedRecommendation.status)}>
                      {selectedRecommendation.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted</Label>
                    <p className="text-sm mt-1">{new Date(selectedRecommendation.createdAt).toLocaleDateString()}</p>
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

                {selectedRecommendation.status === 'rejected' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleReRecommend(selectedRecommendation)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Re-recommend
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Re-recommend Dialog */}
      <AlertDialog open={showReRecommendDialog} onOpenChange={setShowReRecommendDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Re-recommend Question</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={reRecommendData.questionText}
                onChange={(e) => setReRecommendData(prev => ({ ...prev, questionText: e.target.value }))}
                placeholder="Enter your question here..."
                className="mt-1 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label>Answer Choices *</Label>
              <div className="mt-1 space-y-2">
                {reRecommendData.answerChoices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={choice.text}
                        onChange={(e) => handleAnswerChoiceChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type={reRecommendData.answerType === 'radio' ? 'radio' : 'checkbox'}
                        name={reRecommendData.answerType === 'radio' ? 'correctAnswer' : undefined}
                        checked={choice.isCorrect}
                        onChange={(e) => handleAnswerChoiceChange(index, 'isCorrect', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">Correct</span>
                      {reRecommendData.answerChoices.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnswerChoice(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {reRecommendData.answerChoices.length < 15 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAnswerChoice}
                    className="w-full"
                  >
                    Add Answer Choice
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={reRecommendData.explanation}
                onChange={(e) => setReRecommendData(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Provide an explanation for the correct answer..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select 
                value={reRecommendData.difficulty} 
                onValueChange={(value) => setReRecommendData(prev => ({ ...prev, difficulty: value as 'Easy' | 'Medium' | 'Tough' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReRecommendSubmit}
              disabled={!reRecommendData.questionText.trim() || reRecommendData.correctAnswers.length === 0}
            >
              Re-recommend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyRecommendationsPage;
