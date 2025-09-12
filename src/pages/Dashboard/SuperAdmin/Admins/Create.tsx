import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axiosInstance from "@/api/axiosInstance"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"

const CreateSuperAdminPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axiosInstance.post("/superadmins", formData)
      toast.success("SuperAdmin created and invited successfully!")
      navigate("/superadmin/admins")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create superadmin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button className="w-fit" variant="ghost" size="sm" asChild>
          <Link to="/superadmin/admins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create SuperAdmin</h1>
          <p className="text-muted-foreground">
            Add a new superadmin to the system
          </p>
        </div>
      </div>

      <div className="max-w-2xl w-full mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              SuperAdmin Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to create and invite a new superadmin. 
              They will receive an email with setup instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter superadmin's full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter superadmin's email address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  A setup invitation will be sent to this email address
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/superadmin/admins")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create & Invite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateSuperAdminPage
