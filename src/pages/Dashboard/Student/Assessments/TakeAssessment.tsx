import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { studentAssessmentService, type Assessment, type AssessmentResponse } from "@/api/assessmentService";
import { toast } from "sonner";

export default function TakeAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [response, setResponse] = useState<AssessmentResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      startAssessment();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  const startAssessment = async () => {
    try {
      setLoading(true);
      const response = await studentAssessmentService.startAssessment(id!);
      setAssessment(response.data.assessment);
      setResponse(response.data.response);
      setTimeRemaining(response.data.timeRemaining);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error("Error starting assessment:", error);
      toast.error("Failed to start assessment");
      navigate("/student/assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = async () => {
    toast.error("Time is up! Assessment will be auto-submitted.");
    await submitAssessment(true);
  };

  const handleAnswerChange = (answerIndex: number) => {
    const currentQuestion = assessment?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const question = (currentQuestion as any).questionId;
    
    if (question.answerType === "radio") {
      setSelectedAnswers([answerIndex]);
    } else if (question.answerType === "checkbox") {
      setSelectedAnswers(prev => 
        prev.includes(answerIndex) 
          ? prev.filter(a => a !== answerIndex)
          : [...prev, answerIndex]
      );
    }
  };

  const saveAnswer = async () => {
    if (!response || !assessment) return;

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      await studentAssessmentService.submitAnswer(
        response._id,
        (currentQuestion as any).questionId._id,
        selectedAnswers,
        timeSpent
      );
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer");
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < assessment!.questions.length - 1) {
      await saveAnswer();
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswers([]);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      await saveAnswer();
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswers([]);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitAssessment = async () => {
    if (!confirm("Are you sure you want to submit the assessment? This action cannot be undone.")) {
      return;
    }
    await submitAssessment();
  };

  const submitAssessment = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      await saveAnswer();
      
      const result = await studentAssessmentService.submitAssessment(response!._id);
      
      if (autoSubmit) {
        toast.error("Assessment auto-submitted due to time limit");
      } else {
        toast.success("Assessment submitted successfully");
      }
      
      navigate("/student/assessments/results", {
        state: { result: result.data }
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!assessment) return 0;
    return ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !response) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Assessment not found or you don't have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const question = (currentQuestion as any).questionId;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <p className="text-gray-600">{assessment.grade} - {assessment.subject}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5" />
              <span className={timeRemaining < 300 ? "text-red-600" : ""}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Time Remaining</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Instructions */}
      {currentQuestionIndex === 0 && (
        <Alert>
          <AlertDescription>
            <strong>Instructions:</strong> {assessment.instructions}
          </AlertDescription>
        </Alert>
      )}

      {/* Question Navigation */}
      <div className="flex items-center justify-center gap-2">
        {assessment.questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestionIndex ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (index !== currentQuestionIndex) {
                saveAnswer();
                setCurrentQuestionIndex(index);
                setSelectedAnswers([]);
                setQuestionStartTime(Date.now());
              }
            }}
            className="w-10 h-10"
          >
            {index + 1}
          </Button>
        ))}
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="outline">{currentQuestion.marks} marks</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg">
            {question.questionText}
          </div>

          <div className="space-y-3">
            {question.answerChoices.map((choice: any, index: number) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswers.includes(index)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAnswerChange(index)}
              >
                {question.answerType === "radio" ? (
                  selectedAnswers.includes(index) ? (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )
                ) : (
                  <input
                    type="checkbox"
                    checked={selectedAnswers.includes(index)}
                    onChange={() => handleAnswerChange(index)}
                    className="h-4 w-4"
                  />
                )}
                <span className="flex-1">{choice.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {!isLastQuestion ? (
            <Button onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmitAssessment} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining < 300 && timeRemaining > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Warning: Less than 5 minutes remaining! Please save your answers.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
