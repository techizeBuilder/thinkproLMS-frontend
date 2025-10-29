import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { useNavigate } from "react-router-dom";
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

type SalesManager = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  tpaEmpId: string;
  isActive: boolean;
  createdAt: string;
};

export default function SalesManagersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<SalesManager[]>([]);
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
        const res = await axiosInstance.get("/sales/managers");
        setManagers(res.data.data || []);
      } catch (e) {
        // noop for now
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredManagers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return managers.filter((m) => {
      const matchesQuery = q
        ? m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.tpaEmpId?.toLowerCase().includes(q)
        : true;
      const matchesStatus = statusFilter === "active" ? m.isActive : !m.isActive;
      return matchesQuery && matchesStatus;
    });
  }, [managers, searchQuery, statusFilter]);

  const handleDeactivate = async (id: string) => {
    try {
      await axiosInstance.put(`/sales/managers/${id}`, { isActive: false });
      setManagers((prev) =>
        prev.map((m) =>
          m._id === id ? ({ ...m, isActive: false } as SalesManager) : m
        )
      );
    } catch (e: any) {
      // noop
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/sales/managers/${id}`);
      setManagers((prev) => prev.filter((m) => m._id !== id));
    } catch (e: any) {
      // noop
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axiosInstance.post(`/sales/managers/bulk-delete-inactive`);
      setManagers((prev) => prev.filter((m) => m.isActive));
    } catch (e: any) {
      // noop
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await axiosInstance.put(`/sales/managers/${id}`, { isActive: true });
      setManagers((prev) =>
        prev.map((m) =>
          m._id === id ? ({ ...m, isActive: true } as SalesManager) : m
        )
      );
    } catch (e: any) {
      // noop
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Managers</h1>
          <p className="text-gray-600 mt-1">
            Manage your sales management team
          </p>
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
          <Link to="/crm/superadmin/sales-managers/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sales Manager
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
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            ) : managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>No sales managers found.</TableCell>
              </TableRow>
            ) : (
              filteredManagers.map((manager) => (
                <TableRow key={manager._id}>
                  <TableCell className="font-medium">{manager.name}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>{manager.phoneNumber}</TableCell>
                  <TableCell>{manager.tpaEmpId}</TableCell>
                  <TableCell>
                    {manager.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(manager.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/crm/superadmin/sales-managers/${manager._id}/edit`
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
                            onClick={() => setConfirmState({ type: "reactivate", id: manager._id })}
                            className="text-green-700 hover:text-green-800"
                          >
                            Reactivate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setConfirmState({ type: "delete", id: manager._id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setConfirmState({ type: "deactivate", id: manager._id })}
                           className="text-orange-600 hover:text-orange-700"
                         >
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      )}
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
                ? "Deactivate Manager"
                : confirmState?.type === "reactivate"
                ? "Reactivate Manager"
                : confirmState?.type === "delete"
                ? "Delete Manager"
                : "Delete All Inactive Managers"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmState?.type === "deactivate" &&
                "Are you sure you want to deactivate this manager? They can be deleted later from the Inactive view."}
              {confirmState?.type === "reactivate" &&
                "Reactivate this manager so they appear in the Active view and regain access."}
              {confirmState?.type === "delete" &&
                "This will permanently delete the manager and the linked user. This action cannot be undone."}
              {confirmState?.type === "bulk-delete" &&
                "This will permanently delete all inactive managers and their linked users. This action cannot be undone."}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
