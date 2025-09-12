import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { schoolService, type CreateSchoolData } from "@/api/schoolService";
import { toast } from "sonner";

export default function CreateSchoolPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: "",
    address: "",
    board: "CBSE",
    state: "",
    city: "",
    image: "",
    logo: "",
    affiliatedTo: "",
    branchName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove empty optional fields
      const submitData = { ...formData };
      if (!submitData.image) delete submitData.image;
      if (!submitData.logo) delete submitData.logo;
      if (!submitData.affiliatedTo) delete submitData.affiliatedTo;
      if (!submitData.branchName) delete submitData.branchName;

      const response = await schoolService.create(submitData);
      
      if (response.success) {
        toast.success(response.message || "School created successfully");
        navigate("/superadmin/schools");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create school");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/superadmin/schools")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create School</h1>
          <p className="text-gray-600">Add a new school to the system</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter school name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="board">Board *</Label>
                <Select 
                  value={formData.board} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, board: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                placeholder="Enter branch name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliatedTo">Affiliated To</Label>
              <Input
                id="affiliatedTo"
                name="affiliatedTo"
                value={formData.affiliatedTo}
                onChange={handleInputChange}
                placeholder="Enter affiliation details (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="Enter logo URL (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">School Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create School"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/superadmin/schools")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
