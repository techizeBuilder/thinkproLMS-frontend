import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/utils/validation";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SMEditSalesExecutivePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    tpaEmpId: "",
    isActive: true,
    managerName: "",
    managerId: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(`/sales/executives/${id}`);
        const ex = res.data.data;
        setFormData({
          name: ex.name || "",
          email: ex.email || "",
          phoneNumber: ex.phoneNumber || "",
          tpaEmpId: ex.tpaEmpId || "",
          isActive: ex.isActive ?? true,
          managerName: ex.manager?.name || "",
          managerId: ex.manager?._id || "",
        });
      } catch (e: any) {
        toast.error(e.response?.data?.message || "Failed to load executive");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
        managerId: formData.managerId || undefined,
      };
      const res = await axiosInstance.put(`/sales/executives/${id}`, payload);
      if (res.data.success) {
        toast.success("Sales Executive updated");
        navigate("/crm/sales-manager/sales-executives");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update executive");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/crm/sales-manager/sales-executives")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sales Executives
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sales Executive</h1>
          <p className="text-gray-600 mt-1">Update executive details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Sales Executive Details</CardTitle>
          <CardDescription>Edit basic information for this executive.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required disabled={saving} className="h-11 text-base" />
              </div>
              <PhoneInput label="Phone Number" value={formData.phoneNumber} onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))} disabled={saving} />
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required disabled={saving} className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label>TPA Emp Id</Label>
                <Input value={formData.tpaEmpId} disabled className="h-11 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, isActive: v === "active" }))}
                  disabled={saving}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/crm/sales-manager/sales-executives")} disabled={saving} className="h-11 w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={saving} className="h-11 w-full sm:w-auto">{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


