import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Puzzle, 
  Clock, 
  Users, 
  Trophy,
  Play,
  CheckCircle,
  Star
} from "lucide-react";

export default function GuestQuizzes() {
  const quizzes = [
    {
      id: 1,
      title: "Learning Management Systems Basics",
      description: "Test your knowledge about LMS fundamentals and features.",
      questions: 10,
      duration: "5 minutes",
      difficulty: "Beginner",
      participants: 1250,
      rating: 4.5,
      completed: false
    },
    {
      id: 2,
      title: "Digital Learning Trends 2024",
      description: "Explore the latest trends in digital education and e-learning.",
      questions: 15,
      duration: "8 minutes",
      difficulty: "Intermediate",
      participants: 890,
      rating: 4.3,
      completed: true
    },
    {
      id: 3,
      title: "Educational Technology Quiz",
      description: "Challenge yourself with questions about educational technology tools.",
      questions: 20,
      duration: "12 minutes",
      difficulty: "Advanced",
      participants: 567,
      rating: 4.7,
      completed: false
    },
    {
      id: 4,
      title: "Student Engagement Strategies",
      description: "Learn about effective strategies for engaging students in online learning.",
      questions: 12,
      duration: "6 minutes",
      difficulty: "Beginner",
      participants: 2100,
      rating: 4.6,
      completed: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartQuiz = (quizId: number) => {
    // TODO: Implement quiz functionality
    alert(`Quiz functionality for quiz ${quizId} will be implemented soon!`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quizzes & Puzzles</h1>
        <p className="text-gray-600">
          Test your knowledge and challenge yourself with our interactive quizzes and puzzles.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Puzzle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-600">Available Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">1</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">75%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    {quiz.title}
                  </CardTitle>
                  <p className="text-gray-600 text-sm mb-3">
                    {quiz.description}
                  </p>
                </div>
                {quiz.completed && (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {quiz.questions} questions
                </Badge>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {quiz.duration}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Quiz Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{quiz.participants.toLocaleString()} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{quiz.rating}</span>
                  </div>
                </div>

                {/* Progress Bar (for completed quizzes) */}
                {quiz.completed && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Progress</span>
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className={`w-full ${
                    quiz.completed
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  } text-white`}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {quiz.completed ? "Retake Quiz" : "Start Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <Card className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Puzzle className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              More Interactive Content Coming Soon!
            </h3>
            <p className="text-gray-600 mb-4">
              We're working on adding more quizzes, puzzles, and interactive learning activities. 
              Stay tuned for updates!
            </p>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              <Puzzle className="h-4 w-4 mr-2" />
              Get Notified
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
