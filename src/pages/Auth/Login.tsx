import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/api/axiosInstance";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword } from "@/api/authService";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirect authenticated users to their role-based dashboard
  useEffect(() => {
    if (!loading && user) {
      const roleRouteMap: { [key: string]: string } = {
        superadmin: "/superadmin",
        leadmentor: "/leadmentor",
        schooladmin: "/schooladmin",
        admin: "/admin",
        mentor: "/mentor",
        manager: "/hrms/manager",
        finance:"/hrms/finance",
        student: "/student",
        guest: "/guest",
        "IT-Admin":"/hrms/IT-Admin",
        "sales-manager": "/crm/sales-manager",
        "sales-executive": "/crm/sales-executive",
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
      const roleRouteMap: { [key: string]: string } = {
        superadmin: "/superadmin",
        leadmentor: "/leadmentor",
        schooladmin: "/schooladmin",
        admin: "/admin",
        mentor: "/mentor",
        manager: "/hrms/manager",
        finance: "/hrms/finance",
        student: "/student",
        guest: "/guest",
        "IT-Admin": "/hrms/IT-Admin",
        "sales-manager": "/crm/sales-manager",
        "sales-executive": "/crm/sales-executive",
      };
      const dest = roleRouteMap[res.data.user.role] || "/login";
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = () => {
    setShowGuestForm(true);
    setError("");
  };

  const handleBackToLogin = () => {
    setShowGuestForm(false);
    setError("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    setError("");

    try {
      await forgotPassword({ email: forgotPasswordEmail });
      setResetSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setResetSent(false);
    setError("");
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[var(--muted-foreground)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--background)] text-[var(--foreground)]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--stem-technology)] relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-xl bg-[var(--soft-engineering)]"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-2xl bg-[var(--soft-science)]"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full blur-lg bg-[var(--soft-mathematics)]"></div>

        {/* Content */}
        <div className="mx-auto relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="mb-8">
            <div className="w-[240px] h-[240px] rounded-full backdrop-blur-sm shadow-2xl flex items-center justify-center mb-6 bg-[color-mix(in_srgb,_white_16%,_transparent)]">
              <img
                src="/fancy-logo.jpg"
                alt="ThinkPro LMS"
                className="w-[200px] h-[200px] object-cover rounded-full"
              />
            </div>
          </div>
          <p className="text-4xl font-bold text-[var(--sidebar-foreground)] mb-4">
            Welcome to ThinkPro
          </p>
          <p className="text-xl text-[color-mix(in_srgb,_white_88%,_transparent)] mb-8 max-w-md">
            Empowering education through innovative learning management
            solutions
          </p>
          <div className="flex items-center space-x-4 text-[color-mix(in_srgb,_white_80%,_transparent)]">
            <div className="w-2 h-2 rounded-full bg-[color-mix(in_srgb,_white_60%,_transparent)]"></div>
            <span>Secure & Reliable</span>
            <div className="w-2 h-2 rounded-full bg-[color-mix(in_srgb,_white_60%,_transparent)]"></div>
            <span>Modern Interface</span>
            <div className="w-2 h-2 rounded-full bg-[color-mix(in_srgb,_white_60%,_transparent)]"></div>
            <span>Easy to Use</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="m-auto w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 rounded-full shadow-lg flex items-center justify-center bg-[var(--stem-technology)]">
              <img
                src="/fancy-logo.jpg"
                alt="ThinkPro LMS"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
              Welcome to ThinkPro LMS
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
              Sign in to your account
            </p>
          </div>

          {!showGuestForm ? (
            /* Main Login Form */
            <Card className="shadow-xl border border-[var(--border)] bg-card">
              <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-center text-[var(--foreground)]">
                  Sign In
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]"
                    >
                      Email/LoginID
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email or login ID"
                      className="h-10 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="h-10 sm:h-11 text-sm sm:text-base pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs sm:text-sm text-[var(--primary)] hover:text-[var(--accent)] transition-colors duration-200 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  {error && (
                    <div className="p-2 sm:p-3 text-xs sm:text-sm text-[var(--destructive)] bg-[color-mix(in_srgb,_var(--destructive)_12%,_white)] border border-[color-mix(in_srgb,_var(--destructive)_28%,_white)] rounded-md">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-10 sm:h-11 bg-[var(--primary)] hover:bg-[var(--accent)] text-[var(--primary-foreground)] font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base touch-manipulation"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Guest Option */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-[var(--muted-foreground)] mb-3">
                      Don't have an account? Enter as a guest
                    </p>
                    <Button
                      onClick={handleGuestLogin}
                      variant="outline"
                      className="w-full h-10 sm:h-11 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base touch-manipulation"
                    >
                      Enter as Guest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Guest Form */
            <Card className="shadow-xl border border-[var(--border)] bg-card">
              <CardHeader className="space-y-1 pb-4 sm:pb-6 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-[var(--foreground)]">
                    Guest Access
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToLogin}
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm sm:text-base touch-manipulation"
                  >
                    ← Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-center space-y-4">
                  <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
                    Register as a guest to explore our platform and access
                    promotional content.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate("/guest/register")}
                      className="w-full h-10 sm:h-11 bg-[var(--primary)] hover:bg-[var(--accent)] text-[var(--primary-foreground)] font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base touch-manipulation"
                    >
                      Register as Guest
                    </Button>

                    {/* Google Sign In Button */}
                    <GoogleAuthButton
                      onClick={() =>
                        (window.location.href = `${
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:8000/api"
                        }/auth/google`)
                      }
                      disabled={isSubmitting}
                      text="Continue with Google"
                    />

                    <div className="text-xs sm:text-sm text-gray-500">
                      Already have a guest account?{" "}
                      <button
                        onClick={() => navigate("/guest/login")}
                        className="text-[var(--primary)] hover:text-[var(--accent)] font-medium touch-manipulation"
                      >
                        Sign in here
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forgot Password Dialog */}
          <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </DialogDescription>
              </DialogHeader>
              {resetSent ? (
                <div className="space-y-4">
                  <div className="p-4 text-sm text-[var(--muted-foreground)] bg-[color-mix(in_srgb,_var(--primary)_8%,_white)] border border-[color-mix(in_srgb,_var(--primary)_20%,_white)] rounded-md">
                    <p className="font-medium text-[var(--foreground)] mb-2">
                      Check your email
                    </p>
                    <p>
                      If an account exists with this email, a password reset link has been sent.
                      Please check your inbox and follow the instructions to reset your password.
                    </p>
                    <p className="mt-2 text-xs">
                      The link will expire in 1 hour.
                    </p>
                  </div>
                  <Button
                    onClick={handleCloseForgotPassword}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {error && (
                    <div className="p-2 text-xs sm:text-sm text-[var(--destructive)] bg-[color-mix(in_srgb,_var(--destructive)_12%,_white)] border border-[color-mix(in_srgb,_var(--destructive)_28%,_white)] rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseForgotPassword}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSendingReset}
                      className="flex-1"
                    >
                      {isSendingReset ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              © 2024 ThinkPro LMS. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2">
              Powered by{" "}
              <a
                href="https://techizebuilder.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 underline decoration-dotted underline-offset-2"
              >
                TechizeBuilder
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
