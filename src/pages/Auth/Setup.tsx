import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axiosInstance from "@/api/axiosInstance";

export default function Setup() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user info by setupToken
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/setup/user/${token}`);
        setUser(res.data);
        setError("");
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Invalid or expired link";
        setError(message);
        toast.error(message);
      }
    };
    fetchUser();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post(`/setup/complete-setup/${token}`, {
        password,
      });
      const successMessage =
        "✅ Account setup complete! Redirecting to login...";
      setSuccess(successMessage);
      toast.success(successMessage);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-3 sm:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-center text-lg sm:text-xl md:text-2xl">
            {!error
              ? user
                ? `Hi ${user.name}, set your password`
                : "Verifying link..."
              : "Invalid Setup Link"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {error && (
            <p className="text-red-500 text-xs sm:text-sm mb-4">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-xs sm:text-sm mb-4">{success}</p>
          )}

          {!error && user && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-center text-xs sm:text-sm text-gray-500 mb-4">
                Email: <span className="font-medium">{user.email}</span>
              </p>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-sm sm:text-base touch-manipulation"
                disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
