import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/api/axiosInstance";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState<"main" | "guest" | null>(null);

  // Redirect authenticated users to their role-based dashboard
  useEffect(() => {
    if (!loading && user) {
      const roleRouteMap: { [key: string]: string } = {
        superadmin: "/superadmin",
        leadmentor: "/leadmentor", 
        schooladmin: "/schooladmin",
        admin: "/admin",
        mentor: "/mentor",
        student: "/student",
        guest: "/guest"
      };
      
      const route = roleRouteMap[user.role] || "/login";
      navigate(route, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
      setIsSubmitting(false);
    }
  };

  const handleUserTypeSelection = (type: "main" | "guest") => {
    setUserType(type);
    setError("");
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/15 rounded-full blur-lg"></div>
        
        {/* Content */}
        <div className="mx-auto relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <div className="w-[240px] h-[240px] rounded-full bg-white/20 backdrop-blur-sm shadow-2xl flex items-center justify-center mb-6">
              <img 
                src="/fancy-logo.jpg" 
                alt="ThinkPro LMS" 
                className="w-[200px] h-[200px] object-cover rounded-full"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to ThinkPro LMS</h1>
          <p className="text-xl text-white/90 mb-8 max-w-md">
            Empowering education through innovative learning management solutions
          </p>
          <div className="flex items-center space-x-4 text-white/80">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>Secure & Reliable</span>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>Modern Interface</span>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span>Easy to Use</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="m-auto w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center">
              <img 
                src="/fancy-logo.jpg" 
                alt="ThinkPro LMS" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Welcome to ThinkPro LMS</h1>
            <p className="text-sm sm:text-base text-gray-600">Choose how you'd like to access the platform</p>
          </div>

        {!userType ? (
          /* User Type Selection */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-center text-gray-900">
                How would you like to access?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <Button
                onClick={() => handleUserTypeSelection("main")}
                className="w-full h-16 sm:h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1 sm:space-y-2 group relative overflow-hidden rounded-xl touch-manipulation"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-base sm:text-lg lg:text-xl font-bold relative z-10">School Member</span>
                <span className="text-xs hidden sm:flex sm:text-sm opacity-90 relative z-10 text-center px-2">Student, Teacher, or Admin from registered school</span>
              </Button>
              
              <Button
                onClick={() => handleUserTypeSelection("guest")}
                variant="outline"
                className="w-full h-16 sm:h-20 border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1 sm:space-y-2 group relative rounded-xl touch-manipulation"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-base sm:text-lg lg:text-xl font-bold relative z-10">Guest User</span>
                <span className="text-xs hidden sm:flex sm:text-sm opacity-90 relative z-10 text-center px-2">Explore content, take quizzes, request demos</span>
              </Button>
            </CardContent>
          </Card>
        ) : userType === "main" ? (
          /* Main User Login */
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                  School Member Login
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm sm:text-base touch-manipulation"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">
                    Email/LoginID
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email or login ID"
                    className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-10 sm:h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  />
                </div>
                {error && (
                  <div className="p-2 sm:p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base touch-manipulation" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
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
            <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                  Guest Registration
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserType(null)}
                  className="text-gray-500 hover:text-gray-700 text-sm sm:text-base touch-manipulation"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-gray-600">
                  Register as a guest to explore our platform and access promotional content.
                </p>
                <Button
                  onClick={() => navigate("/guest/register")}
                  className="w-full h-10 sm:h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base touch-manipulation"
                >
                  Register as Guest
                </Button>
                <div className="text-xs sm:text-sm text-gray-500">
                  Already have a guest account?{" "}
                  <button
                    onClick={() => navigate("/guest/login")}
                    className="text-green-600 hover:text-green-700 font-medium touch-manipulation"
                  >
                    Sign in here
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2024 ThinkPro LMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
