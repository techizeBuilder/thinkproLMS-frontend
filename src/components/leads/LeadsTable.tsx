import { useEffect, useMemo, useState } from "react";
import { leadService, type Lead } from "@/api/leadService";
import axiosInstance from "@/api/axiosInstance";
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
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
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
import { format, startOfDay, endOfDay } from "date-fns";
import {
  locationService,
  type State as IndiaState,
} from "@/api/locationService";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface LeadsTableProps {
  onAddNew?: () => void;
  onEdit?: (lead: Lead) => void;
}

export default function LeadsTable({ onAddNew, onEdit }: LeadsTableProps) {
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [deliveryModelFilter, setDeliveryModelFilter] = useState("all");
  const [salesCycleFilter, setSalesCycleFilter] = useState("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [pocRoleFilter, setPocRoleFilter] = useState("all");
  const [actionOnFilter, setActionOnFilter] = useState<string>("all");
  const [actionDueDateFrom, setActionDueDateFrom] = useState<string>("");
  const [actionDueDateTo, setActionDueDateTo] = useState<string>("");
  const [actionDueDateExact, setActionDueDateExact] = useState<string>("");
  const [actionDueOpen, setActionDueOpen] = useState(false);
  const [actionDueRange, setActionDueRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [indiaStates, setIndiaStates] = useState<IndiaState[]>([]);
  const [managers, setManagers] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [executives, setExecutives] = useState<
    Array<{ _id: string; name: string }>
  >([]);
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
    cityFilter,
    phaseFilter,
    qualityFilter,
    programFilter,
    leadSourceFilter,
    deliveryModelFilter,
    salesCycleFilter,
    boardFilter,
    pocRoleFilter,
    actionOnFilter,
    actionDueDateFrom,
    actionDueDateTo,
    actionDueDateExact,
    page,
    pageSize,
  ]);

  // Reset to page 1 when filters (except page/pageSize) change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    stateFilter,
    districtFilter,
    cityFilter,
    phaseFilter,
    qualityFilter,
    programFilter,
    leadSourceFilter,
    deliveryModelFilter,
    salesCycleFilter,
    boardFilter,
    pocRoleFilter,
    actionDueDateFrom,
    actionDueDateTo,
    actionDueDateExact,
  ]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await locationService.getStates();
        setIndiaStates(states);
      } catch (e) {
        // ignore toast here to avoid noise; filters still usable
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [mgrRes, execRes] = await Promise.all([
          axiosInstance.get("/sales/managers"),
          axiosInstance.get("/sales/executives"),
        ]);
        setManagers(
          (mgrRes.data?.data || []).map((m: any) => ({
            _id: m._id,
            name: m.name,
          }))
        );
        setExecutives(
          (execRes.data?.data || []).map((e: any) => ({
            _id: e._id,
            name: e.name,
          }))
        );
      } catch {
        // noop
      }
    })();
  }, []);

  const fetchLeads = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setTableLoading(true);
      const res = await leadService.list({
        search: debouncedSearch || undefined,
        state: stateFilter && stateFilter !== "all" ? stateFilter : undefined,
        district: districtFilter || undefined,
        city: cityFilter || undefined,
        phase: phaseFilter !== "all" ? phaseFilter : undefined,
        quality: qualityFilter !== "all" ? qualityFilter : undefined,
        programType: programFilter !== "all" ? programFilter : undefined,
        leadSource: leadSourceFilter !== "all" ? leadSourceFilter : undefined,
        deliveryModel:
          deliveryModelFilter !== "all" ? deliveryModelFilter : undefined,
        salesCycle: salesCycleFilter !== "all" ? salesCycleFilter : undefined,
        boardAffiliated: boardFilter !== "all" ? boardFilter : undefined,
        pocRole: pocRoleFilter !== "all" ? pocRoleFilter : undefined,
        actionOn: actionOnFilter !== "all" ? actionOnFilter : undefined,
        actionDueDateFrom: actionDueDateFrom
          ? startOfDay(new Date(actionDueDateFrom)).toISOString()
          : undefined,
        actionDueDateTo: actionDueDateTo
          ? endOfDay(new Date(actionDueDateTo)).toISOString()
          : undefined,
        actionDueDate: actionDueDateExact || undefined,
        page,
        limit: pageSize,
      });
      setLeads(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
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
    () => indiaStates.map((s) => s.name).sort(),
    [indiaStates]
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
        {/* Row 1: Search, State, District, City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="space-y-1 sm:space-y-2">
            <Label>Search by Name</Label>
            <Input
              placeholder="Lead No / School Name / City"
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
            <Input
              placeholder="District"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>City</Label>
            <Input
              placeholder="City"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Row 2: Remaining filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
          <div className="space-y-1 sm:space-y-2">
            <Label>Action Due Date</Label>
            <Popover open={actionDueOpen} onOpenChange={setActionDueOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(() => {
                    if (actionDueDateExact) {
                      return `${format(
                        new Date(actionDueDateExact),
                        "MMM dd, yyyy"
                      )}`;
                    }
                    if (actionDueDateFrom && actionDueDateTo) {
                      return `${format(
                        new Date(actionDueDateFrom),
                        "MMM dd, yyyy"
                      )} - ${format(
                        new Date(actionDueDateTo),
                        "MMM dd, yyyy"
                      )}`;
                    }
                    if (actionDueDateFrom && !actionDueDateTo) {
                      return `${format(
                        new Date(actionDueDateFrom),
                        "MMM dd, yyyy"
                      )} -`;
                    }
                    return "Select date or range";
                  })()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-2">
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={actionDueRange as any}
                    onSelect={(range) => {
                      const from = range?.from;
                      const to = range?.to;
                      setActionDueRange({ from: from, to: to });
                      if (from && to) {
                        const sameDay =
                          from.toDateString() === to.toDateString();
                        if (sameDay) {
                          setActionDueDateExact(from.toISOString());
                          setActionDueDateFrom("");
                          setActionDueDateTo("");
                        } else {
                          setActionDueDateExact("");
                          setActionDueDateFrom(from.toISOString());
                          setActionDueDateTo(to.toISOString());
                        }
                      } else if (from && !to) {
                        setActionDueDateExact("");
                        setActionDueDateFrom(from.toISOString());
                        setActionDueDateTo("");
                      } else {
                        setActionDueDateExact("");
                        setActionDueDateFrom("");
                        setActionDueDateTo("");
                      }
                    }}
                  />
                  <div className="flex items-center justify-between gap-2 p-2 pt-0">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActionDueRange({});
                        setActionDueDateExact("");
                        setActionDueDateFrom("");
                        setActionDueDateTo("");
                      }}
                    >
                      Clear
                    </Button>
                    <Button onClick={() => setActionDueOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Action On</Label>
            <Select value={actionOnFilter} onValueChange={setActionOnFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Action On" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none" disabled>
                  Managers
                </SelectItem>
                {managers.map((m) => (
                  <SelectItem key={`manager-${m._id}`} value={m._id}>
                    {m.name}
                  </SelectItem>
                ))}
                <SelectItem value="none2" disabled>
                  Executives
                </SelectItem>
                {executives.map((e) => (
                  <SelectItem key={`exec-${e._id}`} value={e._id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>TPA Sales POC</Label>
            <Select value={pocRoleFilter} onValueChange={setPocRoleFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="POC Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
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
            <Label>Lead Source</Label>
            <Select
              value={leadSourceFilter}
              onValueChange={setLeadSourceFilter}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Lead Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["Internal", "Channel Partner"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
          <div className="space-y-1 sm:space-y-2">
            <Label>Quality Of Lead</Label>
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
            <Label>Delivery Model</Label>
            <Select
              value={deliveryModelFilter}
              onValueChange={setDeliveryModelFilter}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Delivery Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["TPA Managed", "School Managed", "Hybrid"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Sales Cycle</Label>
            <Select
              value={salesCycleFilter}
              onValueChange={setSalesCycleFilter}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sales Cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["2025-2026", "2026-2027"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>Board Affiliated</Label>
            <Select value={boardFilter} onValueChange={setBoardFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {["CBSE", "ICSE", "State Board", "IGCSE", "IB", "Other"].map(
                  (b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  )
                )}
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
                            const name = (l.actionOn as any).name as
                              | string
                              | undefined;
                            const byModel =
                              l.actionOnModel === "SalesManager"
                                ? "Manager"
                                : l.actionOnModel === "SalesExecutive"
                                ? "Executive"
                                : undefined;
                            // Fallback to legacy type if present
                            const legacyType =
                              typeof (l.actionOn as any).type === "string"
                                ? (l.actionOn as any).type
                                : undefined;
                            const byLegacy =
                              legacyType === "manager"
                                ? "Manager"
                                : legacyType === "executive"
                                ? "Executive"
                                : undefined;
                            const role = byModel || byLegacy;
                            return name
                              ? role
                                ? `${name} (${role})`
                                : name
                              : "-";
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {leads.length ? (page - 1) * pageSize + 1 : 0} -{" "}
          {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label>Rows per page</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
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
              disabled={page <= 1 || loading || tableLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <div className="text-sm">
              Page {page} of {Math.max(1, pages)}
            </div>
            <Button
              variant="outline"
              disabled={page >= pages || loading || tableLoading}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

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
