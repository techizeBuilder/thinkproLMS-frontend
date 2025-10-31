import { useEffect, useMemo, useState } from "react";
import { leadService, type Lead } from "@/api/leadService";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
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
import { toast } from "sonner";
import { format } from "date-fns";

interface LeadsTableProps {
  onAddNew?: () => void;
  onEdit?: (lead: Lead) => void;
}

export default function LeadsTable({ onAddNew, onEdit }: LeadsTableProps) {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchLeads(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    stateFilter,
    districtFilter,
    phaseFilter,
    qualityFilter,
    programFilter,
  ]);

  const fetchLeads = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setTableLoading(true);
      const res = await leadService.list({
        search: debouncedSearch || undefined,
        state: stateFilter,
        district: districtFilter,
        phase: phaseFilter,
        quality: qualityFilter,
        programType: programFilter,
        limit: 50,
      });
      setLeads(res.data || []);
    } finally {
      if (initial) setLoading(false);
      else setTableLoading(false);
    }
  };

  const handleDelete = (lead: Lead) => setConfirmDelete(lead);

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await leadService.remove(confirmDelete._id);
      toast.success("Lead deleted");
      fetchLeads();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete lead");
    } finally {
      setConfirmDelete(null);
    }
  };

  const states = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.state).filter(Boolean))
      ).sort() as string[],
    [leads]
  );
  const districts = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.district).filter(Boolean))
      ).sort() as string[],
    [leads]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-gray-600">Manage and track school leads</p>
        </div>
        <div className="flex items-center gap-2">
          {onAddNew && (
            <Button onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" /> New Lead
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 items-start">
        {/* <h1 className="font-medium text-sm sm:text-base lg:text-lg">Filters</h1> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Lead No / School / City"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>State</Label>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>District</Label>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Phase</Label>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {[
                  "Lead",
                  "Visit to be scheduled",
                  "Visited",
                  "Demo / PTM etc to be Scheduled",
                  "Proposal to be shared",
                  "Proposal Shared",
                  "Commercial Negotiations underway",
                  "Decision Awaited",
                  "LOI Awaited",
                  "LOI Received",
                  "Contract to be shared",
                  "Contract Shared",
                  "Contract Review underway",
                  "Contract Signed",
                  "Deal Lost",
                  "On Hold",
                  "Pursue next AY",
                  "Invoiced",
                  "Payment Awaited",
                  "Payment Received",
                  "Kits to be Shipped",
                  "Kits Shipped",
                  "Training to be Scheduled",
                  "Training Scheduled",
                  "Training Completed",
                  "Kickoff to be scheduded",
                  "Kickoff Complete",
                ].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Quality</Label>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["Cold", "Warm", "Hot"].map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Program</Label>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["Pilot", "Full"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Lead No</TableHead>
                  <TableHead className="min-w-[200px]">School Name</TableHead>
                  <TableHead className="min-w-[150px]">Action On</TableHead>
                  <TableHead className="min-w-[130px]">
                    Action Due date
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    Action needed - From Team
                  </TableHead>
                  <TableHead className="min-w-[180px]">Phase</TableHead>
                  <TableHead className="min-w-[150px]">TPA Sales POC</TableHead>
                  <TableHead className="min-w-[120px]">City / Town</TableHead>
                  <TableHead className="min-w-[120px]">State</TableHead>
                  <TableHead className="min-w-[120px]">District</TableHead>
                  <TableHead className="min-w-[100px]">Quality</TableHead>
                  <TableHead className="min-w-[100px]">Program Type</TableHead>
                  <TableHead className="min-w-[150px]">
                    Principal Name
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    Principal Contact
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    Principal Email
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    Key Person Name
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    Key Person Contact
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    Key Person Email
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    No of Students
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Avg Fees Per Year
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Annual Contract Value
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Sales Start Date
                  </TableHead>
                  <TableHead className="min-w-[120px]">
                    Sales Closed Date
                  </TableHead>
                  <TableHead className="min-w-[120px]">Lead Source</TableHead>
                  <TableHead className="min-w-[150px]">Lead Remarks</TableHead>
                  <TableHead className="min-w-[150px]">Team Remarks</TableHead>
                  <TableHead className="text-right min-w-[100px] sticky right-0 bg-white z-10">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading || tableLoading) && (
                  <TableRow>
                    <TableCell colSpan={28}>
                      <div className="flex items-center justify-center py-10 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  leads.map((l) => (
                    <TableRow key={l._id}>
                      <TableCell className="whitespace-nowrap">
                        {l.leadNo}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[200px]">
                        {l.schoolName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[150px]">
                        {(() => {
                          if (typeof l.actionOn === "object" && l.actionOn) {
                            const name = (l.actionOn as any).name as string | undefined;
                            const byModel = l.actionOnModel === "SalesManager" ? "Manager" : l.actionOnModel === "SalesExecutive" ? "Executive" : undefined;
                            // Fallback to legacy type if present
                            const legacyType = (typeof (l.actionOn as any).type === "string") ? (l.actionOn as any).type : undefined;
                            const byLegacy = legacyType === "manager" ? "Manager" : legacyType === "executive" ? "Executive" : undefined;
                            const role = byModel || byLegacy;
                            return name ? (role ? `${name} (${role})` : name) : "-";
                          }
                          return "-";
                        })()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[130px]">
                        {l.actionDueDate
                          ? format(new Date(l.actionDueDate), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[200px]">
                        {l.actionNeeded || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[180px]">
                        {l.phase || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[150px]">
                        {l.salesExecutive
                          ? "Executive"
                          : l.salesManager
                          ? "Manager"
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[120px]">
                        {l.city || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap min-w-[120px]">
                        {l.state || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.district || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.qualityOfLead || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.programType || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.principalName || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.principalContact || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.principalEmail || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.keyPersonName || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.keyPersonContact || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.keyPersonEmail || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.noOfStudents || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.avgFeesPerYear || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.annualContractValue
                          ? `₹${l.annualContractValue.toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.salesStartDate
                          ? format(new Date(l.salesStartDate), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.salesClosedDate
                          ? format(new Date(l.salesClosedDate), "MMM dd, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {l.leadSource || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                        {l.leadRemarks || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                        {l.teamRemarks || "-"}
                      </TableCell>
                      <TableCell className="text-right sticky right-0 bg-white z-10">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit && onEdit(l)}
                            aria-label="Edit lead"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(l)}
                            aria-label="Delete lead"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the lead. You can’t undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
