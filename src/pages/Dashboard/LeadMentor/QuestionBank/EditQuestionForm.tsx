import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check } from 'lucide-react';
import { questionBankService, type CreateQuestionData, type Question } from '@/api/questionBankService';
import { subjectService, type Subject } from '@/api/subjectService';
import { moduleService, type ModuleItem } from '@/api/moduleService';
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
    grade: '',
    subject: '',
    module: '',
    answerType: 'radio',
    answerChoices: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswers: [],
    difficulty: 'Medium',
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ];

  const difficulties = ['Easy', 'Medium', 'Tough'];
  const answerTypes = [
    { value: 'radio', label: 'Single Choice (Radio)' },
    { value: 'checkbox', label: 'Multiple Choice (Checkbox)' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multichoice', label: 'Multi Choice' },
  ];

  useEffect(() => {
    if (open && question) {
      // Populate form with question data
      setFormData({
        questionText: question.questionText,
        grade: question.grade,
        subject: question.subject,
        module: question.module,
        answerType: question.answerType,
        answerChoices: question.answerChoices.map(choice => ({
          text: choice.text,
          isCorrect: choice.isCorrect,
        })),
        correctAnswers: question.correctAnswers,
        difficulty: question.difficulty,
      });
      
      fetchSubjects();
    }
  }, [open, question]);

  useEffect(() => {
    if (formData.grade && formData.subject) {
      fetchModules();
    } else {
      setModules([]);
    }
  }, [formData.grade, formData.subject]);

  const fetchSubjects = async () => {
    try {
      const subjectsData = await subjectService.getAllSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchModules = async () => {
    try {
      const gradeNumber = parseInt(formData.grade.replace('Grade ', ''));
      const selectedSubject = subjects.find(s => s.name === formData.subject);
      
      if (selectedSubject) {
        const moduleData = await moduleService.getModulesByGradeAndSubject(gradeNumber, selectedSubject._id);
        setModules(moduleData.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
    }
  };

  const handleInputChange = (field: keyof CreateQuestionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // If grade changes, reset subject and module
    if (field === 'grade') {
      setFormData(prev => ({
        ...prev,
        grade: value,
        subject: '',
        module: '',
      }));
    }

    // If subject changes, reset module
    if (field === 'subject') {
      setFormData(prev => ({
        ...prev,
        subject: value,
        module: '',
      }));
    }
  };

  const handleAnswerChoiceChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const newChoices = [...formData.answerChoices];
    newChoices[index] = {
      ...newChoices[index],
      [field]: value,
    };

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
    if (!formData.grade) {
      toast.error('Grade is required');
      return;
    }
    if (!formData.subject) {
      toast.error('Subject is required');
      return;
    }
    if (!formData.module) {
      toast.error('Module is required');
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject._id} value={subject.name}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="module">Module *</Label>
                  <Select value={formData.module} onValueChange={(value) => handleInputChange('module', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module._id || module.name} value={module.name}>{module.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
