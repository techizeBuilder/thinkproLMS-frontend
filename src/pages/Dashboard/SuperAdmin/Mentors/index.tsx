import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import ProfilePictureDisplay from "@/components/ProfilePictureDisplay";
import { usePaginatedSelect } from "@/hooks/usePaginatedSelect";
import { schoolService } from "@/api/schoolService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface School {
  _id: string;
  name: string;
  city: string;
  state: string;
  boards: string[];
  branchName?: string;
}

interface Mentor {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
    profilePicture?: string | null;
  };
  address: string;
  phoneNumber: string;
  assignedSchools: School[];
  isActive: boolean;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  // Table pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, [page, pageSize]);

  // Load schools with pagination
  const loadSchools = async (page: number, limit: number) => {
    try {
      const response = await schoolService.getAll({ page, limit });
      return response;
    } catch (error) {
      console.error("Error loading schools:", error);
      return { success: false, data: [], pagination: undefined };
    }
  };

  const {
    items: paginatedSchools,
    loading: schoolsLoading,
    hasMore: hasMoreSchools,
    loadMore: loadMoreSchools,
  } = usePaginatedSelect({
    fetchFunction: loadSchools,
    limit: 20,
  });

  useEffect(() => {
    filterMentors();
  }, [mentors, searchTerm, selectedSchool]);

  const fetchMentors = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(pageSize));
      const response = await axiosInstance.get(`/mentors?${params.toString()}`);
      const data = response.data;
      setMentors(data.data || []);
      if (data.pagination) {
        setTotal(data.pagination.total || 0);
        setPages(data.pagination.pages || 1);
      } else {
        setTotal((data.data || []).length);
        setPages(1);
      }
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = mentors;

    if (searchTerm) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.phoneNumber.includes(searchTerm)
      );
    }

    if (selectedSchool) {
      filtered = filtered.filter((mentor) =>
        Array.isArray(mentor.assignedSchools) &&
        mentor.assignedSchools.some((school: any) => {
          if (!school) return false;
          // Handle both populated objects and ObjectId strings
          return typeof school === "string"
            ? school === selectedSchool
            : school._id === selectedSchool;
        })
      );
    }

    setFilteredMentors(filtered);
  };

  const handleDelete = (mentor: Mentor) => {
    const assigned = Array.isArray(mentor.assignedSchools)
      ? mentor.assignedSchools.filter((s: any) => !!s && typeof s !== "string").length
      : 0;
    setConfirmDialog({
      isOpen: true,
      title: "Delete School Mentor",
      message:
        assigned > 0
          ? `${mentor.user?.name ?? "This mentor"} is assigned to ${assigned} school(s). Deleting will remove the mentor account. Consider unassigning schools first. This action cannot be undone.`
          : `Are you sure you want to delete ${mentor.user?.name ?? "this mentor"}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await axiosInstance.delete(`/mentors/${mentor._id}`);
          setMentors((prev) => prev.filter((m) => m._id !== mentor._id));
        } catch (error) {
          console.error("Error deleting mentor:", error);
        }
      },
    });
  };

  if (loading) {
    return <div className="p-6">Loading mentors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Mentors</h1>
          <p className="text-gray-600">Manage mentors assigned to schools</p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/mentors/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add School Mentor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search mentors by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedSchool || "all"}
              onValueChange={(value) => setSelectedSchool(value === "all" ? "" : value)}
            >
              <SelectTrigger className="min-w-[200px]">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {paginatedSchools.map((school) => (
                  <SelectItem key={school._id} value={school._id}>
                    {school.name} - {school.city}
                  </SelectItem>
                ))}
                {hasMoreSchools && (
                  <div
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!schoolsLoading && hasMoreSchools) {
                        loadMoreSchools();
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center justify-center w-full py-2">
                      {schoolsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Schools"
                      )}
                    </div>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 py-2">
          <div className="text-sm text-gray-600">
            Showing {mentors.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-9 w-[110px]"><SelectValue placeholder="Rows per page" /></SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-sm">Page {page} of {Math.max(1, pages)}</div>
            <Button variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
          </div>
        </div>
      )}

      {/* Mentors Table */}
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMentors.map((mentor) => (
              <TableRow key={mentor._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8">
                      <ProfilePictureDisplay
                        profilePicture={mentor.user?.profilePicture}
                        name={mentor.user?.name ?? "User"}
                        size="sm"
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        {mentor.user?.name ?? "—"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    {mentor.user?.email ?? "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    {mentor.phoneNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start text-sm">
                    <MapPin className="mr-2 h-4 w-4 mt-0.5 text-gray-500" />
                    <span className="line-clamp-2">{mentor.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex flex-wrap gap-1">
                      {(mentor.assignedSchools ?? [])
                        .filter((school: any) => !!school && typeof school !== "string")
                        .map((school: any) => (
                          <Badge key={school._id} variant="outline" className="text-xs">
                            {school.name}
                          </Badge>
                        ))}
                      {(!mentor.assignedSchools || mentor.assignedSchools.length === 0) && (
                        <span className="text-xs text-gray-500">No schools</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      mentor.user.isVerified ? "default" : "secondary"
                    }
                  >
                    {mentor.user.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setResetPasswordUser({
                          id: mentor.user._id,
                          name: mentor.user.name,
                          email: mentor.user.email,
                        })
                      }
                      title="Reset Password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/superadmin/mentors/${mentor._id}/edit`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mentor)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-sm text-gray-600">
            Showing {mentors.length ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-9 w-[90px]"><SelectValue /></SelectTrigger>
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
              <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <div className="text-sm">Page {page} of {Math.max(1, pages)}</div>
              <Button variant="outline" disabled={page >= pages || loading} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
            </div>
          </div>
        </div>
      )}
      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No mentors found</p>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          userId={resetPasswordUser.id}
          userName={resetPasswordUser.name}
          userEmail={resetPasswordUser.email}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.isOpen || false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog?.onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
