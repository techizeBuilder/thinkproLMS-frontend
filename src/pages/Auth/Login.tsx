import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/api/axiosInstance";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"main" | "guest" | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedRole) {
      setError("Please select your role");
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      login(res.data.user, res.data.token); // save user + token
      navigate(`/${res.data.user.role}`); // redirect based on role
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeSelection = (type: "main" | "guest") => {
    setUserType(type);
    setError("");
  };

  const getLoginIdLabel = () => {
    switch (selectedRole) {
      case "student":
        return "Login ID";
      case "mentor":
        return "Email Address";
      case "schooladmin":
        return "Email Address";
      case "leadmentor":
        return "Email Address";
      case "superadmin":
        return "Email Address";
      default:
        return "Email Address";
    }
  };

  const getLoginIdPlaceholder = () => {
    switch (selectedRole) {
      case "student":
        return "Enter your login ID";
      case "mentor":
        return "Enter your email address";
      case "schooladmin":
        return "Enter your email address";
      case "leadmentor":
        return "Enter your email address";
      case "superadmin":
        return "Enter your email address";
      default:
        return "Enter your school email";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-white shadow-lg flex items-center justify-center">
            <img 
              src="/fancy-logo.jpg" 
              alt="ThinkPro LMS" 
              className="w-16 h-16 object-contain rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ThinkPro LMS</h1>
          <p className="text-gray-600">Choose how you'd like to access the platform</p>
        </div>

        {!userType ? (
          /* User Type Selection */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                How would you like to access?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleUserTypeSelection("main")}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg font-semibold">School Member</span>
                <span className="text-sm opacity-90">Student, Teacher, or Admin from registered school</span>
              </Button>
              
              <Button
                onClick={() => handleUserTypeSelection("guest")}
                variant="outline"
                className="w-full h-16 border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center space-y-1"
              >
                <span className="text-lg font-semibold">Guest User</span>
                <span className="text-sm opacity-90">Explore content, take quizzes, request demos</span>
              </Button>
            </CardContent>
          </Card>
        ) : userType === "main" ? (
          /* Main User Login */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  School Member Login
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Who are you logging in as?
                  </Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="schooladmin">School Admin</SelectItem>
                      <SelectItem value="leadmentor">Lead Mentor</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {getLoginIdLabel()}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={getLoginIdPlaceholder()}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Guest Registration */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Guest Registration
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Register as a guest to explore our platform and access promotional content.
                </p>
                <Button
                  onClick={() => navigate("/guest/register")}
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Register as Guest
                </Button>
                <div className="text-sm text-gray-500">
                  Already have a guest account?{" "}
                  <button
                    onClick={() => navigate("/guest/login")}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 ThinkPro LMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
