import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";

export default function AddSalesExecutivePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [creationMethod, setCreationMethod] = useState<"invite" | "credentials">("invite");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic client-side validation
      if (!formData.name || !formData.phoneNumber || !formData.email) {
        toast.error("Please fill all required fields");
        setLoading(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }
      if (!isValidPhoneNumber(formData.phoneNumber)) {
        toast.error("Please enter a valid phone number");
        setLoading(false);
        return;
      }
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        createWithCredentials: creationMethod === "credentials",
      };
      if (creationMethod === "credentials") {
        payload.password = password;
      }
      const res = await axiosInstance.post("/sales/executives", payload);
      if (res.data.success) {
        toast.success(res.data.message || "Sales Executive created");
        navigate("/crm/superadmin/sales-executives");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create sales executive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/crm/superadmin/sales-executives")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales Executives
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Sales Executive</h1>
          <p className="text-gray-600 mt-1">Create a new sales executive account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Sales Executive Details</CardTitle>
          <CardDescription>Fill in the details to create and invite a new sales executive.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required disabled={loading} className="h-11 text-base" />
              </div>
              <PhoneInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                required
                disabled={loading}
              />
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required disabled={loading} className="h-11 text-base" />
                <p className="text-sm text-muted-foreground">
                  {creationMethod === "invite" ? "An invitation email will be sent to this address" : "The user will be created with this email and password"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Account Creation Method</Label>
              <RadioGroup value={creationMethod} onValueChange={v => setCreationMethod(v as any)} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invite" id="invite" />
                  <Label htmlFor="invite" className="cursor-pointer">Send Email Invitation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credentials" id="credentials" />
                  <Label htmlFor="credentials" className="cursor-pointer">Create with Manual Credentials</Label>
                </div>
              </RadioGroup>
            </div>

            {creationMethod === "credentials" && (
              <div className="space-y-2 max-w-md">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Set a secure password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} className="h-11 text-base" />
                <p className="text-sm text-muted-foreground">The account will be auto-verified.</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/crm/superadmin/sales-executives")} disabled={loading} className="h-11 w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={loading} className="h-11 w-full sm:w-auto">{loading ? "Creating..." : "Create & Invite"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
