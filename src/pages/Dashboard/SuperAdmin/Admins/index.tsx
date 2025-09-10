import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

interface Admin {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

const AdminsPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axiosInstance.get("/admins");
        setAdmins(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admins Management</h1>
        <div className="flex justify-end mb-6">
          <a
            href="/superadmin/admins/create"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Add New Admin
          </a>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No admins found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 text-left font-medium">Name</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-4">{admin.name}</td>
                    <td className="p-4">{admin.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          admin.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {admin.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminsPage;
