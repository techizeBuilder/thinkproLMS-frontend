import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, Mail, Phone } from "lucide-react";
import { schoolAdminService, type Mentor } from "@/api/schoolAdminService";
import { toast } from "sonner";

export default function SchoolAdminMentorsPage() {
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [, setSchoolAdmin] = useState<any>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    loadMentors();
  }, [page, pageSize]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const response = await schoolAdminService.getMentors({ page, limit: pageSize });
      
      if (response.success) {
        setMentors(response.data.mentors);
        setSchoolAdmin(response.data.schoolAdmin);
        setTotal(response.pagination?.total || response.data.mentors.length);
        setPages(response.pagination?.pages || 1);
      } else {
        toast.error("Failed to load mentors");
      }
    } catch (error) {
      console.error("Error loading mentors:", error);
      toast.error("Failed to load mentors");
    } finally {
      setLoading(false);
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">School Mentors</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage mentors assigned to your schools
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">
            {mentors.length} Mentor(s)
          </span>
        </div>
      </div>

      {/* Mentors Table */}
      {mentors.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8 md:py-12">
            <div className="text-center">
              <UserCheck className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-semibold mb-2">No Mentors Found</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                No mentors are currently assigned to your schools.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[200px]">Assigned Schools</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentors.map((mentor) => (
                    <TableRow key={mentor._id}>
                      <TableCell className="font-medium sticky left-0 bg-background z-10 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          {mentor.user?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                          {mentor.user?.email || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                          {mentor.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(mentor.assignedSchools ?? [])
                            .filter((school: any) => !!school && typeof school !== "string")
                            .map((school: any) => (
                              <Badge key={school._id} variant="outline" className="text-xs">
                                {school.name} - {school.city}
                              </Badge>
                            ))}
                          {(!mentor.assignedSchools || mentor.assignedSchools.length === 0) && (
                            <span className="text-xs text-gray-500">No schools assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={mentor.user?.isVerified ? "default" : "secondary"}>
                            {mentor.user?.isVerified ? "Verified" : "Pending"}
                          </Badge>
                          <Badge variant={mentor.isActive ? "default" : "destructive"}>
                            {mentor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(mentor.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-gray-600">
            Showing {mentors.length ? (page - 1) * pageSize + 1 : 0} -{" "}
            {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>Rows per page</Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <div className="text-sm">
                Page {page} of {Math.max(1, pages)}
              </div>
              <Button
                variant="outline"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
