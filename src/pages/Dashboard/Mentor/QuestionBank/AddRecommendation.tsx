import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Check, ChevronsUpDown, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { questionBankService, questionRecommendationService, type CreateQuestionData } from "@/api/questionBankService";
import { useAuth } from "@/contexts/AuthContext";

const AddRecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const { } = useAuth();
  const [formData, setFormData] = useState<CreateQuestionData>({
    questionText: '',
    session: '',
    grade: '',
    subject: '',
    module: '',
    answerType: 'radio',
    answerChoices: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswers: [],
    explanation: '',
    difficulty: 'Medium',
  });
  const [loading, setLoading] = useState(false);
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


  const difficulties = ['Easy', 'Medium', 'Tough'];
  const answerTypes = [
    { value: 'radio', label: 'Single right answer' },
    { value: 'checkbox', label: 'Multiple right answers' },
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    }
  };

  const handleInputChange = (field: keyof CreateQuestionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnswerChoiceChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const newChoices = [...formData.answerChoices];
    
    if (field === 'isCorrect' && formData.answerType === 'radio') {
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

    setFormData(prev => ({
      ...prev,
      answerChoices: newChoices,
    }));

    // Update correct answers
    if (field === 'isCorrect') {
      const correctAnswers = newChoices
        .map((choice, idx) => choice.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);
      
      setFormData(prev => ({
        ...prev,
        correctAnswers,
      }));
    }
  };

  const addAnswerChoice = () => {
    if (formData.answerChoices.length < 15) {
      setFormData(prev => ({
        ...prev,
        answerChoices: [...prev.answerChoices, { text: '', isCorrect: false }],
      }));
    }
  };

  const removeAnswerChoice = (index: number) => {
    if (formData.answerChoices.length > 2) {
      const newChoices = formData.answerChoices.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        answerChoices: newChoices,
      }));

      // Update correct answers
      const correctAnswers = newChoices
        .map((choice, idx) => choice.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);
      
      setFormData(prev => ({
        ...prev,
        correctAnswers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (!formData.session) {
      toast.error('Please select a session');
      return;
    }

    if (formData.answerChoices.length < 2) {
      toast.error('At least 2 answer choices are required');
      return;
    }

    if (formData.answerChoices.some(choice => !choice.text.trim())) {
      toast.error('All answer choices must have text');
      return;
    }

    if (formData.correctAnswers.length === 0) {
      toast.error('At least one correct answer must be selected');
      return;
    }

    if (formData.answerType === 'radio' && formData.correctAnswers.length > 1) {
      toast.error('Single choice questions can only have one correct answer');
      return;
    }

    setLoading(true);

    try {
      await questionRecommendationService.createRecommendation(formData);
      toast.success('Question recommendation submitted successfully');
      navigate('/mentor/question-bank');
    } catch (error: any) {
      console.error('Error recommending question:', error);
      toast.error(error.response?.data?.message || 'Failed to recommend question');
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find(s => s._id === formData.session);

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
          <h1 className="text-2xl md:text-3xl font-bold">Recommend Question</h1>
          <p className="text-gray-600">Submit a question recommendation for review</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={formData.questionText}
                onChange={(e) => handleInputChange('questionText', e.target.value)}
                placeholder="Enter your question here..."
                className="mt-1 min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="session">Session *</Label>
              <Popover open={sessionSelectOpen} onOpenChange={setSessionSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sessionSelectOpen}
                    className="w-full justify-between mt-1"
                  >
                    {selectedSession ? selectedSession.displayName || selectedSession.name : "Select session..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sessions..." />
                    <CommandEmpty>No session found.</CommandEmpty>
                    <CommandGroup>
                      {sessions.map((session) => (
                        <CommandItem
                          key={session._id}
                          value={session._id}
                          onSelect={() => {
                            handleInputChange('session', session._id);
                            setSessionSelectOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.session === session._id ? "opacity-100" : "opacity-0"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="answerType">Answer Type *</Label>
                <Select value={formData.answerType} onValueChange={(value) => handleInputChange('answerType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Answer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {answerTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
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
          </CardContent>
        </Card>

        {/* Answer Choices */}
        <Card>
          <CardHeader>
            <CardTitle>Answer Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.answerChoices.map((choice, index) => (
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
                    type={formData.answerType === 'radio' ? 'radio' : 'checkbox'}
                    name={formData.answerType === 'radio' ? 'correctAnswer' : undefined}
                    checked={choice.isCorrect}
                    onChange={(e) => handleAnswerChoiceChange(index, 'isCorrect', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Correct</span>
                  {formData.answerChoices.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAnswerChoice(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {formData.answerChoices.length < 15 && (
              <Button
                type="button"
                variant="outline"
                onClick={addAnswerChoice}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Answer Choice
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Explanation (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Provide an explanation for the correct answer..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mentor/question-bank')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Recommendation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRecommendationPage;
