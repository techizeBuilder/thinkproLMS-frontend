import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/api/axiosInstance";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default function GuestRegister() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      if (error === 'google_not_configured') {
        setError("Google authentication is not configured. Please use the registration form below.");
      } else {
        setError("Google authentication failed. Please try again.");
      }
      return;
    }

    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        login(userData, token);
        navigate("/guest", { replace: true });
      } catch (err) {
        setError("Failed to process Google authentication. Please try again.");
      }
    }
  }, [searchParams, login, navigate]);

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
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    guestType: "student",
    city: "",
    phoneNumber: "",
    // Student fields
    schoolName: "",
    grade: "",
    // Parent fields
    childName: "",
    childSchoolName: "",
    // Other fields
    organisation: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSubmitting(false);
      return;
    }

    // Validate phone number if provided
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      setError("Please enter a valid phone number");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/register-guest", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        guestType: formData.guestType,
        city: formData.city,
        phoneNumber: formData.phoneNumber,
        schoolName: formData.guestType === "student" ? formData.schoolName : undefined,
        grade: formData.guestType === "student" ? formData.grade : undefined,
        childName: formData.guestType === "parent" ? formData.childName : undefined,
        childSchoolName: formData.guestType === "parent" ? formData.childSchoolName : undefined,
        organisation: formData.guestType === "other" ? formData.organisation : undefined,
      });

      login(res.data.user, res.data.token);
      navigate("/guest"); // Redirect to guest home page
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google`;
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-white shadow-lg flex items-center justify-center">
            <img 
              src="/fancy-logo.jpg" 
              alt="ThinkPro LMS" 
              className="w-16 h-16 object-contain rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Guest Registration</h1>
          <p className="text-gray-600">Join as a guest to explore our platform</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Create Guest Account
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Login
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Guest Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  I am a:
                </Label>
                <RadioGroup
                  value={formData.guestType}
                  onValueChange={(value) => handleInputChange("guestType", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="text-sm font-medium">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parent" id="parent" />
                    <Label htmlFor="parent" className="text-sm font-medium">
                      Parent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-sm font-medium">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <PhoneInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(value) => handleInputChange("phoneNumber", value)}
                    required
                  />
                </div>
              </div>

              {/* Type-specific Fields */}
              {formData.guestType === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-sm font-medium text-gray-700">
                      School Name *
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange("schoolName", e.target.value)}
                      placeholder="Enter your school name"
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                      Grade *
                    </Label>
                    <Input
                      id="grade"
                      type="text"
                      value={formData.grade}
                      onChange={(e) => handleInputChange("grade", e.target.value)}
                      placeholder="Enter your grade"
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.guestType === "parent" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName" className="text-sm font-medium text-gray-700">
                      Child's Name *
                    </Label>
                    <Input
                      id="childName"
                      type="text"
                      value={formData.childName}
                      onChange={(e) => handleInputChange("childName", e.target.value)}
                      placeholder="Enter your child's name"
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childSchoolName" className="text-sm font-medium text-gray-700">
                      Child's School Name *
                    </Label>
                    <Input
                      id="childSchoolName"
                      type="text"
                      value={formData.childSchoolName}
                      onChange={(e) => handleInputChange("childSchoolName", e.target.value)}
                      placeholder="Enter your child's school name"
                      className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.guestType === "other" && (
                <div className="space-y-2">
                  <Label htmlFor="organisation" className="text-sm font-medium text-gray-700">
                    Organisation/Institution *
                  </Label>
                  <Input
                    id="organisation"
                    type="text"
                    value={formData.organisation}
                    onChange={(e) => handleInputChange("organisation", e.target.value)}
                    placeholder="Enter your organisation or institution"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a password"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Guest Account"
                )}
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <GoogleAuthButton
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              text="Continue with Google"
            />
          </CardContent>
        </Card>

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
