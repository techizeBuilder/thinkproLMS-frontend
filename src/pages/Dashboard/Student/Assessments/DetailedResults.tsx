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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/student/assessments/results")} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Assessment Results</h1>
          <p className="text-sm sm:text-base text-gray-600">Detailed review of your performance</p>
        </div>
      </div>

      {/* Assessment Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3 p-3 sm:p-6">
          <CardTitle className="flex items-center text-blue-800 text-base sm:text-lg">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {result.assessment.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                {result.percentage.toFixed(1)}%
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Score</p>
            </div>
            <div className="text-center">
              <Badge className={`text-sm sm:text-lg px-2 sm:px-3 py-1 ${getGradeColor(result.grade)}`}>
                {result.grade}
              </Badge>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Grade</p>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                {result.totalMarksObtained}/{result.assessment.totalMarks}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Marks</p>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                {formatTime(result.timeSpent)}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Time Spent</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-blue-700 font-medium text-sm sm:text-base">
              {getPerformanceMessage(result.percentage)}
            </p>
          </div>

          <div className="flex justify-center items-center gap-4 sm:gap-6 mt-3 sm:mt-4">
            <div className="text-center p-2 sm:p-3 bg-green-100 rounded-lg">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{correctAnswers.length}</div>
              <p className="text-xs sm:text-sm text-green-700">Correct</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-100 rounded-lg">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{wrongAnswers.length}</div>
              <p className="text-xs sm:text-sm text-red-700">Incorrect</p>
            </div>
            <div className="text-center p-2 sm:p-3 bg-blue-100 rounded-lg">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{result.assessment.questions.length}</div>
              <p className="text-xs sm:text-sm text-blue-700">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wrong Answers with Explanations */}
      {wrongAnswers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center text-red-800 text-base sm:text-lg">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Incorrect Answers & Explanations
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Review the questions you answered incorrectly and learn from the explanations.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            {wrongAnswers.map((question: any, index) => (
              <div key={String(question.questionId) || index} className="border border-red-200 rounded-lg p-3 sm:p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                      Q{result.assessment.questions.findIndex(q => q.questionId === question.questionId) + 1}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                      {question.marks}m
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-red-600 font-medium">
                    {question.studentAnswer?.marksObtained || 0}/{question.marks}
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{question.questionText}</h4>
                  
                  <div className="space-y-1 sm:space-y-2">
                    {question.answerChoices.map((choice: any, choiceIndex: number) => {
                      const isSelected = question.studentAnswer?.selectedAnswers.includes(choiceIndex);
                      const isCorrect = question.correctAnswers.includes(choiceIndex);
                      
                      return (
                        <div
                          key={choiceIndex}
                          className={`p-2 sm:p-3 rounded-lg border-2 ${
                            isCorrect
                              ? "border-green-500 bg-green-50"
                              : isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            ) : isSelected ? (
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            ) : (
                              <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={`font-medium text-xs sm:text-sm ${
                              isCorrect ? "text-green-800" : isSelected ? "text-red-800" : "text-gray-700"
                            }`}>
                              {String.fromCharCode(65 + choiceIndex)}. {choice.text}
                            </span>
                            {isCorrect && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Correct
                              </Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge className="bg-red-100 text-red-800 text-xs">
                                Yours
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {question.explanation && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <h5 className="font-semibold text-blue-800 text-xs sm:text-sm">Explanation</h5>
                    </div>
                    <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}

                <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                  Time: {formatTime(question.studentAnswer?.timeSpent || 0)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Correct Answers with Options */}
      {correctAnswers.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle className="flex items-center text-green-800 text-base sm:text-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Correct Answers ({correctAnswers.length})
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Review the questions you answered correctly. Options show the correct choice and your selection.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>Correct option</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-gray-300 bg-green-50" />
                <span>Your selection</span>
              </div>
            </div>

            {correctAnswers.map((question: any, index) => {
              const questionNumber = result.assessment.questions.findIndex(q => q.questionId === question.questionId) + 1;
              return (
                <div key={String(question.questionId) || index} className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                        Q{questionNumber}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                        {question.marks}m
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-green-700 font-medium">
                      {question.studentAnswer?.marksObtained || 0}/{question.marks}
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{question.questionText}</h4>

                    <div className="space-y-1 sm:space-y-2">
                      {question.answerChoices.map((choice: any, choiceIndex: number) => {
                        const isSelected = question.studentAnswer?.selectedAnswers.includes(choiceIndex);
                        const isCorrect = question.correctAnswers.includes(choiceIndex);

                        return (
                          <div
                            key={choiceIndex}
                            className={`p-2 sm:p-3 rounded-lg border-2 ${
                              isCorrect
                                ? "border-green-500 bg-green-50"
                                : isSelected
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              ) : isSelected ? (
                                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-green-300" />
                              ) : (
                                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={`font-medium text-xs sm:text-sm ${
                                isCorrect ? "text-green-800" : isSelected ? "text-green-700" : "text-gray-700"
                              }`}>
                                {String.fromCharCode(65 + choiceIndex)}. {choice.text}
                              </span>
                              {isCorrect && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Correct
                                </Badge>
                              )}
                              {isSelected && !isCorrect && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Yours
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                    Time: {formatTime(question.studentAnswer?.timeSpent || 0)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Assessment Details */}
      <Card>
        <CardHeader className="pb-3 p-3 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Assessment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Grade</h4>
              <p className="text-gray-600 text-xs sm:text-sm">Grade {result.assessment.grade}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Submitted On</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                {new Date(result.submittedAt).toLocaleDateString()} at{" "}
                {new Date(result.submittedAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Duration</h4>
              <p className="text-gray-600 text-xs sm:text-sm">
                {result.assessment.duration} min (Spent: {formatTime(result.timeSpent)})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
