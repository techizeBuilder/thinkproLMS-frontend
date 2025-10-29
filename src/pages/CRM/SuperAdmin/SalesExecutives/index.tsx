import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, PowerOff } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type SalesExecutive = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  tpaEmpId: string;
  isActive: boolean;
  createdAt: string;
  manager?: { name: string } | null;
};

export default function SalesExecutivesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">(
    "active"
  );
  const [confirmState, setConfirmState] = useState<
    { type: "deactivate" | "reactivate" | "delete" | "bulk-delete"; id?: string } | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/sales/executives");
        setExecutives(res.data.data || []);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      await axiosInstance.put(`/sales/executives/${id}`, { isActive: false });
      setExecutives((prev) =>
        prev.map((e) =>
          e._id === id ? ({ ...e, isActive: false } as SalesExecutive) : e
        )
      );
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/sales/executives/${id}`);
      setExecutives((prev) => prev.filter((e) => e._id !== id));
    } catch {}
  };

  const handleDeleteAll = async () => {
    try {
      await axiosInstance.post(`/sales/executives/bulk-delete-inactive`);
      setExecutives((prev) => prev.filter((e) => e.isActive));
    } catch {}
  };

  const handleReactivate = async (id: string) => {
    try {
      await axiosInstance.put(`/sales/executives/${id}`, { isActive: true });
      setExecutives((prev) =>
        prev.map((e) =>
          e._id === id ? ({ ...e, isActive: true } as SalesExecutive) : e
        )
      );
    } catch {}
  };

  const filteredExecutives = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return executives.filter((e) => {
      const matchesQuery = q
        ? e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.tpaEmpId?.toLowerCase().includes(q)
        : true;
      const matchesStatus = statusFilter === "active" ? e.isActive : !e.isActive;
      return matchesQuery && matchesStatus;
    });
  }, [executives, searchQuery, statusFilter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Executives</h1>
          <p className="text-gray-600 mt-1">Manage your sales executive team</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search name, email, or emp id"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 md:w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
          >
            <SelectTrigger className="h-10 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {statusFilter === "inactive" && (
            <Button variant="destructive" onClick={() => setConfirmState({ type: "bulk-delete" })}>
              Delete All
            </Button>
          )}
          <Link to="/crm/superadmin/sales-executives/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sales Executive
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>TPA Emp Id</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>Loading...</TableCell>
              </TableRow>
            ) : executives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No sales executives found.</TableCell>
              </TableRow>
            ) : (
              filteredExecutives.map((executive) => (
                <TableRow key={executive._id}>
                  <TableCell className="font-medium">
                    {executive.name}
                  </TableCell>
                  <TableCell>{executive.email}</TableCell>
                  <TableCell>{executive.phoneNumber}</TableCell>
                  <TableCell>{executive.tpaEmpId}</TableCell>
                  <TableCell>
                    {executive.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(executive.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/crm/superadmin/sales-executives/${executive._id}/edit`
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {statusFilter === "inactive" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmState({ type: "reactivate", id: executive._id })}
                            className="text-green-700 hover:text-green-800"
                          >
                            Reactivate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setConfirmState({ type: "delete", id: executive._id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmState({ type: "deactivate", id: executive._id })}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!confirmState}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmState?.type === "deactivate"
                ? "Deactivate Executive"
                : confirmState?.type === "reactivate"
                ? "Reactivate Executive"
                : confirmState?.type === "delete"
                ? "Delete Executive"
                : "Delete All Inactive Executives"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState?.type === "deactivate" &&
                "Are you sure you want to deactivate this executive? They can be deleted later from the Inactive view."}
              {confirmState?.type === "reactivate" &&
                "Reactivate this executive so they appear in the Active view and regain access."}
              {confirmState?.type === "delete" &&
                "This will permanently delete the executive and the linked user. This action cannot be undone."}
              {confirmState?.type === "bulk-delete" &&
                "This will permanently delete all inactive executives and their linked users. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmState(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmState?.type === "deactivate" && confirmState.id)
                  handleDeactivate(confirmState.id);
                if (confirmState?.type === "reactivate" && confirmState.id)
                  handleReactivate(confirmState.id);
                if (confirmState?.type === "delete" && confirmState.id)
                  handleDelete(confirmState.id);
                if (confirmState?.type === "bulk-delete") handleDeleteAll();
                setConfirmState(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
