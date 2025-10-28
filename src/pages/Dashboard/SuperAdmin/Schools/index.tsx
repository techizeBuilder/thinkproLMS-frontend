import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MapPin, Building, Loader2 } from "lucide-react";
import { MobileActions } from "@/components/ui/mobile-actions";
import { schoolService, type School } from "@/api/schoolService";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Filter states
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [searchName, setSearchName] = useState<string>("");
  const [searchBoard, setSearchBoard] = useState<string>("");
  const [selectedStrength, setSelectedStrength] = useState<string>("all");

  // Debounced search values
  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedSearchBoard = useDebounce(searchBoard, 500);
  const states = Array.from(
    new Set(schools.map((school) => school.state))
  ).sort();
  const cities = Array.from(
    new Set(schools.map((school) => school.city))
  ).sort();

  // Strength filter options
  const strengthOptions = [
    { value: "all", label: "All Strengths" },
    { value: "upto-500", label: "Up to 500" },
    { value: "501-1000", label: "501-1000" },
    { value: "1001-1500", label: "1001-1500" },
    { value: "1501-2000", label: "1501-2000" },
    { value: "2001-2500", label: "2001-2500" },
    { value: "2501-3000", label: "2501-3000" },
    { value: "3001-3500", label: "3001-3500" },
    { value: "3501-4000", label: "3501-4000" },
    { value: "4001-4500", label: "4001-4500" },
    { value: "4501-5000", label: "4501-5000" },
    { value: "above-5000", label: "Above 5000" },
  ];

  // Count active and inactive schools
  const activeCount = schools.filter((school) => school.isActive).length;
  const inactiveCount = schools.filter((school) => !school.isActive).length;

  useEffect(() => {
    fetchSchools();
  }, [
    selectedState,
    selectedCity,
    statusFilter,
    debouncedSearchName,
    debouncedSearchBoard,
    selectedStrength,
  ]);

  const fetchSchools = async () => {
    try {
      // Use table loading for subsequent requests, full loading for initial load
      if (schools.length === 0) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }
      
      const filters = {
        state: selectedState,
        city: selectedCity,
        statusFilter,
        name: debouncedSearchName,
        board: debouncedSearchBoard,
        strength: selectedStrength,
      };

      console.log("Fetching schools with filters:", filters);

      const response = await schoolService.getAll(filters);
      if (response.success) {
        console.log("Schools received:", response.data.length);
        setSchools(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching schools:", error);
      toast.error(error.response?.data?.message || "Failed to fetch schools");
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone and will permanently remove the school from the system.`
    );

    if (!confirmed) {
      return;
    }

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

  const handleToggleStatus = async (
    id: string,
    name: string,
    currentStatus: boolean
  ) => {
    setToggleLoading(id);
    try {
      const response = await schoolService.toggleStatus(id, !currentStatus);
      if (response.success) {
        toast.success(
          `${name} ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchSchools(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update school status"
      );
    } finally {
      setToggleLoading(null);
    }
  };

  const clearFilters = () => {
    setSelectedState("all");
    setSelectedCity("all");
    setStatusFilter("active");
    setSearchName("");
    setSearchBoard("");
    setSelectedStrength("all");
  };

  const getBoardColor = (board: string) => {
    switch (board) {
      case "CBSE":
        return "bg-blue-100 text-blue-800";
      case "ICSE":
        return "bg-green-100 text-green-800";
      case "State Board":
        return "bg-purple-100 text-purple-800";
      case "IGCSE":
        return "bg-orange-100 text-orange-800";
      case "IB":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">
            Schools
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            Manage all schools in the system ({schools.length}{" "}
            {schools.length === 1 ? "school" : "schools"})
          </p>
        </div>
        <Link to="/superadmin/schools/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="state-filter" className="text-xs sm:text-sm">
                State
              </Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-9 sm:h-10">
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

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="city-filter" className="text-xs sm:text-sm">
                City
              </Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-9 sm:h-10">
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

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="status-filter" className="text-xs sm:text-sm">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    Active Only
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inactive Only
                  </SelectItem>
                  <SelectItem value="all">
                    All Schools
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">&nbsp;</Label>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="name-search" className="text-xs sm:text-sm">
                Search by Name
              </Label>
              <Input
                id="name-search"
                placeholder="Enter school name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="board-search"
                className="text-xs sm:text-sm"
              >
                Search by Board
              </Label>
              <Input
                id="board-search"
                placeholder="Enter board (e.g., CBSE, ICSE)"
                value={searchBoard}
                onChange={(e) => setSearchBoard(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="strength-filter" className="text-xs sm:text-sm">
                Students Strength
              </Label>
              <Select
                value={selectedStrength}
                onValueChange={setSelectedStrength}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select strength range" />
                </SelectTrigger>
                <SelectContent>
                  {strengthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                      School Name
                    </TableHead>
                    <TableHead className="min-w-[120px]">School ID</TableHead>
                    <TableHead className="min-w-[120px]">Board</TableHead>
                    <TableHead className="min-w-[180px]">Location</TableHead>
                    <TableHead className="min-w-[200px]">Address</TableHead>
                    <TableHead className="min-w-[100px]">Students</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Branch</TableHead>
                    <TableHead className="min-w-[150px]">Affiliation</TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading schools...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schools.map((school) => (
                    <TableRow
                      key={school._id}
                      className={!school.isActive ? "opacity-75" : ""}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[200px]">
                        {school.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 font-mono">
                          {school._id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {school.boards && school.boards.length > 0 ? (
                            school.boards.map((board) => (
                              <Badge
                                key={board}
                                className={getBoardColor(board)}
                              >
                                {board}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No boards
                            </span>
                          )}
                        </div>
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
                        <span className="text-sm font-medium">
                          {school.students_strength?.toLocaleString() || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={school.isActive ? "default" : "secondary"}
                        >
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
                        <MobileActions
                          editUrl={`/superadmin/schools/${school._id}/edit`}
                          onToggleStatus={() =>
                            handleToggleStatus(
                              school._id,
                              school.name,
                              school.isActive
                            )
                          }
                          onDelete={() => handleDelete(school._id, school.name)}
                          isActive={school.isActive}
                          isSuperAdmin={true}
                          deleteLoading={deleteLoading === school._id}
                          toggleLoading={toggleLoading === school._id}
                        />
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
