import axiosInstance from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";

export default function SuperAdmin() {
  const testAPI = async () => {
    try {
      const data = await axiosInstance.post("/users/admin", {
        name: "Admin User",
        email: "admin@example.com",
      });
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      SuperAdmin
      <Button onClick={testAPI}>Create Admin</Button>
    </div>
  );
}
