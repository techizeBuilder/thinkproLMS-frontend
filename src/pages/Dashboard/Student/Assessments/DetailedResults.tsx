import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  XCircle,
  BookOpen,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { studentAssessmentService, type DetailedAssessmentResult } from "@/api/assessmentService";
import { toast } from "sonner";

export default function DetailedAssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<DetailedAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDetailedResult();
    }
  }, [id]);

  const loadDetailedResult = async () => {
    try {
      setLoading(true);
      const response = await studentAssessmentService.getDetailedAssessmentResult(id!);
      if (response.success) {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Error loading detailed result:", error);
      toast.error("Failed to load assessment result");
      navigate("/student/assessments/results");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800";
      case "B+":
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C+":
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Excellent work! Outstanding performance!";
    if (percentage >= 80) return "Great job! Well done!";
    if (percentage >= 70) return "Good work! Keep it up!";
    if (percentage >= 60) return "Satisfactory performance. Room for improvement.";
    if (percentage >= 50) return "Below average. Consider reviewing the material.";
    return "Needs improvement. Please review the concepts and try again.";
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getWrongAnswers = () => {
    if (!result) return [];
    return result.assessment.questions.filter((question: any) => 
      question.studentAnswer && !question.studentAnswer.isCorrect
    );
  };

  const getCorrectAnswers = () => {
    if (!result) return [];
    return result.assessment.questions.filter((question: any) => 
      question.studentAnswer && question.studentAnswer.isCorrect
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading detailed results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Result not found</h3>
            <p className="text-gray-600 mb-4">
              The requested assessment result could not be found.
            </p>
            <Button onClick={() => navigate("/student/assessments/results")}>
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wrongAnswers = getWrongAnswers();
  const correctAnswers = getCorrectAnswers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/student/assessments/results")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Assessment Results</h1>
          <p className="text-gray-600">Detailed review of your performance</p>
        </div>
      </div>

      {/* Assessment Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Trophy className="h-5 w-5 mr-2" />
            {result.assessment.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {result.percentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Score</p>
            </div>
            <div className="text-center">
              <Badge className={`text-lg px-3 py-1 ${getGradeColor(result.grade)}`}>
                {result.grade}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Grade</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {result.totalMarksObtained}/{result.assessment.totalMarks}
              </div>
              <p className="text-sm text-gray-600">Marks</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatTime(result.timeSpent)}
              </div>
              <p className="text-sm text-gray-600">Time Spent</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-blue-700 font-medium">
              {getPerformanceMessage(result.percentage)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctAnswers.length}</div>
              <p className="text-sm text-green-700">Correct Answers</p>
            </div>
            <div className="text-center p-3 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{wrongAnswers.length}</div>
              <p className="text-sm text-red-700">Incorrect Answers</p>
            </div>
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{result.assessment.questions.length}</div>
              <p className="text-sm text-blue-700">Total Questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wrong Answers with Explanations */}
      {wrongAnswers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <XCircle className="h-5 w-5 mr-2" />
              Incorrect Answers & Explanations
            </CardTitle>
            <p className="text-sm text-gray-600">
              Review the questions you answered incorrectly and learn from the explanations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {wrongAnswers.map((question: any, index) => (
              <div key={String(question.questionId) || index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      Question {result.assessment.questions.findIndex(q => q.questionId === question.questionId) + 1}
                    </Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      {question.marks} marks
                    </Badge>
                  </div>
                  <div className="text-sm text-red-600 font-medium">
                    {question.studentAnswer?.marksObtained || 0}/{question.marks} marks
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{question.questionText}</h4>
                  
                  <div className="space-y-2">
                    {question.answerChoices.map((choice: any, choiceIndex: number) => {
                      const isSelected = question.studentAnswer?.selectedAnswers.includes(choiceIndex);
                      const isCorrect = question.correctAnswers.includes(choiceIndex);
                      
                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect
                              ? "border-green-500 bg-green-50"
                              : isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : isSelected ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={`font-medium ${
                              isCorrect ? "text-green-800" : isSelected ? "text-red-800" : "text-gray-700"
                            }`}>
                              {String.fromCharCode(65 + choiceIndex)}. {choice.text}
                            </span>
                            {isCorrect && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Correct Answer
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Your Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <h5 className="font-semibold text-blue-800">Explanation</h5>
                    </div>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Time spent: {formatTime(question.studentAnswer?.timeSpent || 0)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Correct Answers Summary */}
      {correctAnswers.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Correct Answers ({correctAnswers.length})
            </CardTitle>
            <p className="text-sm text-gray-600">
              Questions you answered correctly.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {correctAnswers.map((question: any, index) => {
                const questionNumber = result.assessment.questions.findIndex(q => q.questionId === question.questionId) + 1;
                return (
                  <div key={String(question.questionId) || index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-green-100 text-green-800">
                        Question {questionNumber}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {question.questionText}
                    </p>
                    <div className="text-xs text-green-600 font-medium">
                      {question.studentAnswer?.marksObtained || 0}/{question.marks} marks
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Assessment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Grade</h4>
              <p className="text-gray-600">Grade {result.assessment.grade}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Submitted On</h4>
              <p className="text-gray-600">
                {new Date(result.submittedAt).toLocaleDateString()} at{" "}
                {new Date(result.submittedAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Duration</h4>
              <p className="text-gray-600">
                {result.assessment.duration} minutes (Time spent: {formatTime(result.timeSpent)})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
