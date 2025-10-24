import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, MapPin, Users, Search, Filter } from "lucide-react";
import { schoolService } from "@/api/schoolService";
import { sessionProgressService } from "@/api/sessionProgressService";
import { useAuth } from "@/contexts/AuthContext";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  boards?: string[];
  branchName?: string;
  isActive?: boolean;
  students_strength?: number;
  affiliatedTo?: string;
}

interface SessionProgressSchool {
  _id: string;
  name: string;
  city: string;
  state: string;
}

export default function LeadMentorSchoolsPage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      
      // Check if user has global access (superadmin or specific permissions)
      const hasGlobalAccess = user?.role === "superadmin" || 
        user?.permissions?.includes("global_school_access");
      
      if (hasGlobalAccess) {
        // Get all schools for global access
        const response = await schoolService.getAll();
        if (response.success) {
          setSchools(response.data);
        }
      } else {
        // Get schools available to this lead mentor
        const response = await sessionProgressService.getAvailableSchools();
        // Convert sessionProgressService School format to our School format
        const convertedSchools: School[] = response.map((school: SessionProgressSchool) => ({
          _id: school._id,
          name: school.name,
          city: school.city,
          state: school.state,
          address: "",
          boards: [],
          branchName: "",
          isActive: true, // Assume active for session progress schools
          students_strength: 0,
          affiliatedTo: ""
        }));
        setSchools(convertedSchools);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique states and cities for filter options
  const states = Array.from(new Set(schools.map(school => school.state))).sort();
  const cities = Array.from(new Set(schools.map(school => school.city))).sort();

  // Filter schools based on search and filters
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = selectedState === "all" || school.state === selectedState;
    const matchesCity = selectedCity === "all" || school.city === selectedCity;
    const matchesActive = includeInactive || school.isActive !== false;
    
    return matchesSearch && matchesState && matchesCity && matchesActive;
  });

  const getBoardColor = (board: string) => {
    const colors: { [key: string]: string } = {
      'CBSE': 'bg-blue-100 text-blue-800',
      'ICSE': 'bg-green-100 text-green-800',
      'State Board': 'bg-purple-100 text-purple-800',
      'IGCSE': 'bg-orange-100 text-orange-800',
      'IB': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[board] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Schools</h1>
          <p className="text-gray-600">Loading schools...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schools</h1>
        <p className="text-gray-600">
          {user?.role === "superadmin" || user?.permissions?.includes("global_school_access") 
            ? "All schools in the system" 
            : "Schools assigned to you"
          }
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeInactive"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="includeInactive" className="text-sm">
                Include Inactive
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Schools ({filteredSchools.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSchools.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedState !== "all" || selectedCity !== "all" || includeInactive
                  ? "Try adjusting your filters to see more schools."
                  : "No schools are available at the moment."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">School Name</TableHead>
                    <TableHead className="min-w-[120px]">Boards</TableHead>
                    <TableHead className="min-w-[150px]">Location</TableHead>
                    <TableHead className="min-w-[200px]">Address</TableHead>
                    <TableHead className="min-w-[100px]">Strength</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">School ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school._id} className={school.isActive === false ? 'opacity-75' : ''}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{school.name}</div>
                          {school.branchName && (
                            <div className="text-sm text-gray-600">{school.branchName}</div>
                          )}
                          {school.affiliatedTo && (
                            <div className="text-xs text-gray-500 mt-1">
                              Affiliated to: {school.affiliatedTo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {school.boards && school.boards.length > 0 ? (
                            school.boards.map((board, index) => (
                              <Badge key={index} className={`text-xs ${getBoardColor(board)}`}>
                                {board}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No boards</span>
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
                          {school.address || 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-3 w-3" />
                          <span className="font-medium">
                            {school.students_strength?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={school.isActive !== false ? "default" : "secondary"}>
                          {school.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 font-mono">
                          {school._id}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredSchools.length} of {schools.length} schools
        {user?.role === "superadmin" || user?.permissions?.includes("global_school_access") 
          ? " (Global Access)" 
          : " (Assigned to you)"
        }
      </div>
    </div>
  );
}
