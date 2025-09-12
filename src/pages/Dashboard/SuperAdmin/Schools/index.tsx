import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Building } from "lucide-react";
import { schoolService, type School } from "@/api/schoolService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await schoolService.getAll();
      if (response.success) {
        setSchools(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteLoading(id);
    try {
      const response = await schoolService.delete(id);
      if (response.success) {
        toast.success(`${name} deleted successfully`);
        fetchSchools(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete school");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getBoardColor = (board: string) => {
    switch (board) {
      case "CBSE": return "bg-blue-100 text-blue-800";
      case "ICSE": return "bg-green-100 text-green-800";
      case "State": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading schools...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schools</h1>
          <p className="text-gray-600">Manage all schools in the system</p>
        </div>
        <Link to="/superadmin/schools/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      {schools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by creating your first school.
            </p>
            <Link to="/superadmin/schools/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Card key={school._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{school.name}</CardTitle>
                    <Badge className={getBoardColor(school.board)}>
                      {school.board}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/superadmin/schools/${school._id}/edit`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete School</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{school.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(school._id, school.name)}
                            disabled={deleteLoading === school._id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleteLoading === school._id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {school.city}, {school.state}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {school.address}
                  </p>
                  {school.branchName && (
                    <p className="text-sm font-medium text-blue-600">
                      Branch: {school.branchName}
                    </p>
                  )}
                  {school.affiliatedTo && (
                    <p className="text-xs text-gray-500">
                      Affiliated to: {school.affiliatedTo}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
