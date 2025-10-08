import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { sessionService, type Session } from "@/api/sessionService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function Sessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  // Check if user has permission to manage sessions
  const hasPermission =
    user?.role === "superadmin" || user?.permissions?.includes("add_modules");

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchTerm, selectedGrade]);

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          session.displayName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof session.module === "object" &&
            session.module.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by grade
    if (selectedGrade !== "all") {
      filtered = filtered.filter((s) => s.grade === parseInt(selectedGrade));
    }

    setFilteredSessions(filtered);
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getAllSessions();
      setSessions(data);
      setFilteredSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await sessionService.deleteSession(id);
      toast.success("Session deleted successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">
            Manage learning sessions across different grades
          </p>
        </div>
        {hasPermission && (
          <Button
            onClick={() => {
              const basePath =
                user?.role === "superadmin" ? "/superadmin" : "/leadmentor";
              navigate(`${basePath}/sessions/create`);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sessions by name or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
              <SelectItem key={grade} value={grade.toString()}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardContent className="p-0">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-4">
                {sessions.length === 0
                  ? "Get started by creating your first session."
                  : "No sessions match your current filters."}
              </p>
              {hasPermission && sessions.length === 0 && (
                <Button
                  onClick={() => {
                    const basePath =
                      user?.role === "superadmin"
                        ? "/superadmin"
                        : "/leadmentor";
                    navigate(`${basePath}/sessions/create`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Session
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created Date</TableHead>
                  {hasPermission && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        {session.displayName || session.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeof session.module === "object"
                          ? session.module.name
                          : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Grade {session.grade}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {session.description || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    {hasPermission && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const basePath =
                                user?.role === "superadmin"
                                  ? "/superadmin"
                                  : "/leadmentor";
                              navigate(
                                `${basePath}/sessions/${session._id}/edit`
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(session._id!)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
