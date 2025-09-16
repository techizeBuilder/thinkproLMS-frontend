import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, MapPin, Building, Power, PowerOff } from "lucide-react";
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
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  
  // Filter states
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [includeInactive, setIncludeInactive] = useState<boolean>(false);
  
  // Get unique states and cities for filter options
  const states = Array.from(new Set(schools.map(school => school.state))).sort();
  const cities = Array.from(new Set(schools.map(school => school.city))).sort();
  
  // Count active and inactive schools
  const activeCount = schools.filter(school => school.isActive).length;
  const inactiveCount = schools.filter(school => !school.isActive).length;

  useEffect(() => {
    fetchSchools();
  }, [selectedState, selectedCity, includeInactive]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolService.getAll({
        state: selectedState,
        city: selectedCity,
        includeInactive
      });
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

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    setToggleLoading(id);
    try {
      const response = await schoolService.toggleStatus(id, !currentStatus);
      if (response.success) {
        toast.success(`${name} ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchSchools(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update school status");
    } finally {
      setToggleLoading(null);
    }
  };

  const clearFilters = () => {
    setSelectedState("all");
    setSelectedCity("all");
    setIncludeInactive(false);
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
          <p className="text-gray-600">
            Manage all schools in the system ({schools.length} {schools.length === 1 ? 'school' : 'schools'})
          </p>
        </div>
        <Link to="/superadmin/schools/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state-filter">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city-filter">City</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select 
                value={includeInactive ? "all" : "active"} 
                onValueChange={(value) => setIncludeInactive(value === "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only ({activeCount})</SelectItem>
                  <SelectItem value="all">All (Including Inactive) ({activeCount + inactiveCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Affiliation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school._id} className={!school.isActive ? 'opacity-75' : ''}>
                    <TableCell className="font-medium">
                      {school.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBoardColor(school.board)}>
                        {school.board}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-1 h-3 w-3" />
                        {school.city}, {school.state}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm truncate" title={school.address}>
                        {school.address}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={school.isActive ? "default" : "secondary"}>
                        {school.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {school.branchName ? (
                        <span className="text-sm font-medium text-blue-600">
                          {school.branchName}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {school.affiliatedTo ? (
                        <span className="text-xs text-gray-500">
                          {school.affiliatedTo}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(school._id, school.name, school.isActive)}
                          disabled={toggleLoading === school._id}
                          className={school.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                          title={school.isActive ? "Deactivate school" : "Activate school"}
                        >
                          {toggleLoading === school._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : school.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
