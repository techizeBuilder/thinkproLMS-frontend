import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Trash2 } from 'lucide-react';
import { questionBankService, type CreateQuestionData, type Question } from '@/api/questionBankService';
import { toast } from 'sonner';

interface EditQuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question | null;
  onSuccess: () => void;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({
  open,
  onOpenChange,
  question,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateQuestionData>({
    questionText: '',
    session: '',
    answerType: 'radio',
    answerChoices: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswers: [],
    explanation: '',
    difficulty: 'Medium',
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
  const [loading, setLoading] = useState(false);
  const [sessionSelectOpen, setSessionSelectOpen] = useState(false);


  const difficulties = ['Easy', 'Medium', 'Tough'];
  const answerTypes = [
    { value: 'radio', label: 'Single right answer' },
    { value: 'checkbox', label: 'Multiple right answers' },
  ];

  useEffect(() => {
    if (open && question) {
      // Populate form with question data
      setFormData({
        questionText: question.questionText,
        session: question.session?._id || '',
        answerType: question.answerType,
        answerChoices: question.answerChoices.map(choice => ({
          text: choice.text,
          isCorrect: choice.isCorrect,
        })),
        correctAnswers: question.correctAnswers,
        explanation: question.explanation || '',
        difficulty: question.difficulty,
      });
      
      fetchSessions();
    }
  }, [open, question]);

  const fetchSessions = async () => {
    try {
      const response = await questionBankService.getSessions();
      if (response.success) {
        setSessions(response.data);
      }
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
      const correctAnswers = newChoices
        .map((choice, idx) => choice.isCorrect ? idx : -1)
        .filter(idx => idx !== -1);

      setFormData(prev => ({
        ...prev,
        answerChoices: newChoices,
        correctAnswers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question) return;

    // Validation
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if (!formData.session) {
      toast.error('Session is required');
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

    try {
      setLoading(true);
      const response = await questionBankService.updateQuestion(question._id, formData);
      if (response.success) {
        toast.success('Question updated successfully');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast.error(error.response?.data?.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={(e) => handleInputChange('questionText', e.target.value)}
                  placeholder="Enter your question here..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
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
                        {formData.session
                          ? sessions.find((session) => session._id === formData.session)?.displayName ||
                            `${sessions.find((session) => session._id === formData.session)?.grade}.${sessions.find((session) => session._id === formData.session)?.sessionNumber?.toString().padStart(2, '0')} ${sessions.find((session) => session._id === formData.session)?.name}`
                          : "Select Session"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search sessions..." />
                        <CommandList>
                          <CommandEmpty>No sessions found.</CommandEmpty>
                          <CommandGroup>
                            {sessions.map((session) => (
                              <CommandItem
                                key={session._id}
                                value={`${session.displayName || `${session.grade}.${session.sessionNumber?.toString().padStart(2, '0')} ${session.name}`} ${session.module.name}`}
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
              <CardTitle className="flex items-center justify-between">
                Answer Choices
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAnswerChoice}
                  disabled={formData.answerChoices.length >= 15}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Choice
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.answerChoices.map((choice, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type={formData.answerType === 'checkbox' ? 'checkbox' : 'radio'}
                      name="correctAnswer"
                      checked={choice.isCorrect}
                      onChange={(e) => handleAnswerChoiceChange(index, 'isCorrect', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Correct</span>
                  </div>
                  <Input
                    value={choice.text}
                    onChange={(e) => handleAnswerChoiceChange(index, 'text', e.target.value)}
                    placeholder={`Answer choice ${index + 1}`}
                    className="flex-1"
                  />
                  {formData.answerChoices.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnswerChoice(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {formData.correctAnswers.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">Correct Answers Selected:</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.correctAnswers.map(answerIndex => (
                      <Badge key={answerIndex} className="bg-green-100 text-green-800">
                        Choice {answerIndex + 1}: {formData.answerChoices[answerIndex]?.text}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="explanation">Explanation for Correct Answer</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => handleInputChange('explanation', e.target.value)}
                  placeholder="Provide an explanation for why the correct answer(s) is/are correct..."
                  className="mt-1"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This explanation will help students understand why the correct answer is right.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestionForm;
