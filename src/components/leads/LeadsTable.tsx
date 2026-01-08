import { useEffect, useMemo, useState } from "react";
import { leadService, type Lead } from "@/api/leadService";
import axiosInstance from "@/api/axiosInstance";
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
  Archive,
  RotateCcw,
  Calendar as CalendarIcon,
  Download,
  Eye,
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
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";
import { useSearchParams} from "react-router-dom";
import { ArrowUp, ArrowDown } from "lucide-react";
interface LeadsTableProps {
  onAddNew?: () => void;
  onEdit?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
}
type SalesManager = {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
};
type SalesExecutive = {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
}: MultiSelectProps) {
 

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left h-10"
          >
            {value.length ? `${value.length} selected` : placeholder}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0">
          <div className="max-h-64 overflow-y-auto">
            <div className="p-2">
              {options.map((item) => {
                const checked = value.includes(item.value);

                return (
                  <div
                    key={item.value}
                    onClick={() => {
                      if (checked) {
                        onChange(value.filter((v) => v !== item.value));
                      } else {
                        onChange([...value, item.value]);
                      }
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted"
                  >
                    <div className="h-4 w-4 border rounded flex items-center justify-center">
                      {checked && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function LeadsTable({ onAddNew, onEdit,onView }: LeadsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
   const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
   const loggedInRole = loggedInUser?.role;
  const { user } = useAuth();
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
  const [phaseFilter, setPhaseFilter] = useState<string[]>([]);
  const [qualityFilter, setQualityFilter] = useState<string[]>([]);
  const [programFilter, setProgramFilter] = useState<string[]>([]);
  const [leadSourceFilter, setLeadSourceFilter] = useState<string[]>([]);
  const [deliveryModelFilter, setDeliveryModelFilter] = useState<string[]>([]);
  const [salesCycleFilter, setSalesCycleFilter] = useState<string[]>([]);
  const [boardFilter, setBoardFilter] = useState<string[]>([]);
  const [pocRoleFilter] = useState<string[]>([]);
  const [actionOnFilter, setActionOnFilter] = useState<string[]>([]);
  const [managerFilter, setManagerFilter] = useState<string[]>([]);
  const [executiveFilter, setExecutiveFilter] = useState<string[]>([]);

  const [actionDueDateFrom, setActionDueDateFrom] = useState<string>("");
  const [actionDueDateTo, setActionDueDateTo] = useState<string>("");
  const [actionDueDateExact, setActionDueDateExact] = useState<string>("");
  const [actionDueOpen, setActionDueOpen] = useState(false);
  const [managers, setManagers] = useState<SalesManager[]>([]);
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [actionDueRange, setActionDueRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [indiaStates, setIndiaStates] = useState<IndiaState[]>([]);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    lead: Lead;
    action: "activate" | "deactivate";
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "all"
  >("active");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchLeads(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    useEffect(() => {
      (async () => {
        try {
          const [mgrRes, execRes] = await Promise.all([
            axiosInstance.get("/sales/managers"),
            axiosInstance.get("/sales/executives"),
          ]);
          setManagers(mgrRes.data.data || []);
          setExecutives(execRes.data.data || []);
        } catch {}
      })();
    }, []);

    const handleSort = (key: string) => {
      if (sortKey === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortOrder("asc");
      }
    };


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
    leadSourceFilter,
    deliveryModelFilter,
    salesCycleFilter,
    boardFilter,
    pocRoleFilter,
    actionOnFilter,
    actionDueDateFrom,
    actionDueDateTo,
    actionDueDateExact,
    statusFilter,
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
    statusFilter,
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



  const fetchLeads = async (initial = false) => {
    try {
      if (initial) setLoading(true);
      else setTableLoading(true);

      const res = await leadService.list({
        search: debouncedSearch || undefined,
        state: stateFilter && stateFilter !== "all" ? stateFilter : undefined,
        district: districtFilter || undefined,

        phase: phaseFilter.length ? phaseFilter : undefined,
        quality: qualityFilter.length ? qualityFilter : undefined,
        programType: programFilter.length ? programFilter : undefined,
        leadSource: leadSourceFilter.length ? leadSourceFilter : undefined,
        deliveryModel: deliveryModelFilter.length
          ? deliveryModelFilter
          : undefined,
        salesCycle: salesCycleFilter.length ? salesCycleFilter : undefined,
        boardAffiliated: boardFilter.length ? boardFilter : undefined,

        // ✅ YAHI MAIN FIX HAI
        salesManager: managerFilter.length ? managerFilter : undefined,

        salesExecutive: executiveFilter.length ? executiveFilter : undefined,

        actionOn: actionOnFilter.length ? actionOnFilter : undefined,

        actionDueDateFrom: actionDueDateFrom
          ? startOfDay(new Date(actionDueDateFrom)).toISOString()
          : undefined,

        actionDueDateTo: actionDueDateTo
          ? endOfDay(new Date(actionDueDateTo)).toISOString()
          : undefined,

        actionDueDate: actionDueDateExact || undefined,
        status: statusFilter,

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
  const updateParam = (
    key: string,
    value?: string | string[] | number | boolean
  ) => {
    const params = new URLSearchParams(searchParams);

    if (
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }

    setSearchParams(params, { replace: true });
  };


  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setStateFilter(searchParams.get("state") || "all");
    setDistrictFilter(searchParams.get("district") || "");
    setStatusFilter(
      (searchParams.get("status") as "active" | "inactive" | "all") || "active"
    );

    setPhaseFilter(searchParams.get("phase")?.split(",") || []);
    setQualityFilter(searchParams.get("quality")?.split(",") || []);
    setProgramFilter(searchParams.get("program")?.split(",") || []);
    setLeadSourceFilter(searchParams.get("leadSource")?.split(",") || []);
    setDeliveryModelFilter(searchParams.get("deliveryModel")?.split(",") || []);
    setSalesCycleFilter(searchParams.get("salesCycle")?.split(",") || []);
    setBoardFilter(searchParams.get("board")?.split(",") || []);
    setManagerFilter(searchParams.get("manager")?.split(",") || []);
    setExecutiveFilter(searchParams.get("executive")?.split(",") || []);
    setActionOnFilter(searchParams.get("actionOn")?.split(",") || []);

    setActionDueDateFrom(searchParams.get("dueFrom") || "");
    setActionDueDateTo(searchParams.get("dueTo") || "");
    setActionDueDateExact(searchParams.get("dueExact") || "");

    setPage(Number(searchParams.get("page") || 1));
  }, [searchParams]);


 

  const getLeadCreatorId = (lead: Lead): string | null => {
    if (!lead?.createdBy) return null;
    if (typeof lead.createdBy === "string") return lead.createdBy;
    if (
      typeof lead.createdBy === "object" &&
      typeof lead.createdBy._id === "string"
    ) {
      return lead.createdBy._id;
    }
    return null;
  };

  const canManageLead = (lead: Lead) => {
    if (!user?.id) return false;

    // SuperAdmin can manage any lead irrespective of creator
    if (user.role === "superadmin") return true;

    // Check if user is the creator
    if (getLeadCreatorId(lead) === user.id) return true;

    // Check if user is assigned as TPA Sales POC (Executive)
    if (lead.salesExecutive && typeof lead.salesExecutive === "object") {
      if (lead.salesExecutive.user?._id === user.id) return true;
    }

    // Check if user is assigned as TPA Sales POC (Manager)
    if (lead.salesManager && typeof lead.salesManager === "object") {
      if (lead.salesManager.user?._id === user.id) return true;
    }

    // Check if user is assigned as Action on
    if (lead.actionOn && typeof lead.actionOn === "object") {
      if (lead.actionOn.user?._id === user.id) return true;
    }

    return false;
  };

  const openStatusChangeDialog = (lead: Lead) => {
    if (!canManageLead(lead)) {
      toast.error("You can only manage leads that you created or are assigned to");
      return;
    }
    const action = lead.isActive === false ? "activate" : "deactivate";
    setPendingStatusChange({ lead, action });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { lead, action } = pendingStatusChange;
    try {
      if (action === "deactivate") {
        await leadService.remove(lead._id);
        toast.success("Lead deactivated");
      } else {
        await leadService.activate(lead._id);
        toast.success("Lead activated");
      }
      fetchLeads();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          `Failed to ${action === "deactivate" ? "deactivate" : "activate"} lead`
      );
    } finally {
      setPendingStatusChange(null);
    }
  };

  const SortHead = ({
    label,
    sortBy,
    className = "",
  }: {
    label: string;
    sortBy: string;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer select-none ${className}`}
      onClick={() => handleSort(sortBy)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortBy ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <span className="text-gray-300">
            <ArrowUp className="h-3 w-3" />
          </span>
        )}
      </div>
    </TableHead>
  );


  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      const params: any = {
        search: debouncedSearch || undefined,
        state: stateFilter && stateFilter !== "all" ? stateFilter : undefined,
        district: districtFilter || undefined,
        phase: phaseFilter.length ? phaseFilter : undefined,
        quality: qualityFilter.length ? qualityFilter : undefined,
        programType: programFilter.length ? programFilter : undefined,
        leadSource: leadSourceFilter.length ? leadSourceFilter : undefined,
        deliveryModel: deliveryModelFilter.length
          ? deliveryModelFilter
          : undefined,
        salesCycle: salesCycleFilter.length ? salesCycleFilter : undefined,
        boardAffiliated: boardFilter.length ? boardFilter : undefined,
        pocRole: pocRoleFilter.length ? pocRoleFilter : undefined,
        actionOn: actionOnFilter.length ? actionOnFilter : undefined,
        actionDueDateFrom: actionDueDateFrom
          ? startOfDay(new Date(actionDueDateFrom)).toISOString()
          : undefined,
        actionDueDateTo: actionDueDateTo
          ? endOfDay(new Date(actionDueDateTo)).toISOString()
          : undefined,
        actionDueDate: actionDueDateExact || undefined,
        status: statusFilter,
      };

      const blob = await leadService.exportToExcel(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-export-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Leads exported successfully");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Failed to export leads to Excel"
      );
    } finally {
      setExporting(false);
    }
  };

  const states = useMemo(
    () => indiaStates.map((s) => s.name).sort(),
    [indiaStates]
  );

  const clearAllFilters = () => {
    setSearchParams({});
  };


const actionOnOptions = [
  ...managers.map((m) => ({
    label: `Manager - ${m.name}`,
    value: m._id,
  })),
  ...executives.map((e) => ({
    label: `Executive - ${e.name}`,
    value: e._id,
  })),
];
const managerOptions = managers
  .filter((m) => m.isActive)
  .map((m) => ({
    label: m.name,
    value: m._id,
  }));
const executiveOptions = executives
  .filter((e) => e.isActive)
  .map((e) => ({
    label: e.name,
    value: e._id,
  }));

const toOptions = (arr: string[]) =>
  arr.map((item) => ({
    label: item,
    value: item,
  }));


const sortedLeads = [...leads].sort((a: any, b: any) => {
  if (!sortKey) return 0;

  const aVal = a[sortKey];
  const bVal = b[sortKey];

  if (aVal == null) return 1;
  if (bVal == null) return -1;

  if (typeof aVal === "number" && typeof bVal === "number") {
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  }

  return sortOrder === "asc"
    ? String(aVal).localeCompare(String(bVal))
    : String(bVal).localeCompare(String(aVal));
});


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-gray-600">Manage and track school leads</p>
        </div>
        {(loggedInRole === "superadmin" || loggedInRole === "manager") && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export to Excel
            </Button>

            {onAddNew && (
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" /> New Lead
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-start">
        {/* Row 1: Search, State, District, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="space-y-1 sm:space-y-2">
            <Label>Search by Name</Label>
            <Input
              placeholder="Lead No / School Name"
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label>State</Label>
            <Select
              value={stateFilter}
              onValueChange={(v) => updateParam("state", v)}
            >
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
            <Label>Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "active" | "inactive" | "all")
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Archived</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
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
                  className="w-full justify-start text-left font-normal truncate whitespace-nowrap overflow-hidden"
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
            <MultiSelect
              label="Action On"
              value={actionOnFilter}
              onChange={(v) => updateParam("actionOn", v)}
              options={actionOnOptions}
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="TPA Sales POC (Manager)"
              value={managerFilter}
              onChange={(v) => updateParam("manager", v)}
              options={managerOptions}
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <div className="space-y-1 sm:space-y-2">
              <MultiSelect
                label="TPA Sales POC (Executive)"
                value={executiveFilter}
                onChange={setExecutiveFilter}
                options={executiveOptions}
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Phase"
              value={phaseFilter}
              onChange={(v) => updateParam("phase", v)}
              options={toOptions([
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
              ])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Lead Source"
              value={leadSourceFilter}
              onChange={(v) => updateParam("leadSource", v)}
              options={toOptions(["Internal", "Channel Partner"])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Program"
              value={programFilter}
              onChange={(v) => updateParam("program", v)}
              options={toOptions(["Pilot", "Full"])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Quality Of Lead"
              value={qualityFilter}
              onChange={(v) => updateParam("quality", v)}
              options={toOptions(["Cold", "Warm", "Hot"])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Delivery Model"
              value={deliveryModelFilter}
              onChange={(v) => updateParam("deliveryModel", v)}
              options={toOptions(["TPA Managed", "School Managed", "Hybrid"])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Sales Cycle"
              value={salesCycleFilter}
              onChange={(v) => updateParam("salesCycle", v)}
              options={toOptions(["2025-2026", "2026-2027"])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <MultiSelect
              label="Board Affiliated"
              value={boardFilter}
              onChange={(v) => updateParam("board", v)}
              options={toOptions([
                "CBSE",
                "ICSE",
                "State Board",
                "IGCSE",
                "IB",
                "Other",
              ])}
            />
          </div>
          <div className="space-y-1 sm:space-y-2 flex items-end justify-end mb-1 mr-6">
            <Button
              onClick={clearAllFilters}
              size="sm"
              className="
      flex items-center gap-2
      bg-blue-50
      text-blue-700
      hover:bg-blue-100
    "
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <SortHead
              label="Lead No"
              sortBy="leadNo"
              className="min-w-[100px]"
            />
            <SortHead
              label="School Name"
              sortBy="schoolName"
              className="min-w-[200px]"
            />
            <SortHead
              label="Action On"
              sortBy="actionOn"
              className="min-w-[150px]"
            />
            <SortHead
              label="Action Due Date"
              sortBy="actionDueDate"
              className="min-w-[130px]"
            />
            <SortHead
              label="Action Needed - From Team"
              sortBy="actionNeeded"
              className="min-w-[200px]"
            />
            <SortHead label="Phase" sortBy="phase" className="min-w-[180px]" />
            <SortHead
              label="TPA Sales POC"
              sortBy="salesExecutive"
              className="min-w-[150px]"
            />
            <SortHead
              label="City / Town"
              sortBy="city"
              className="min-w-[120px]"
            />
            <SortHead label="State" sortBy="state" className="min-w-[120px]" />
            <SortHead
              label="District"
              sortBy="district"
              className="min-w-[120px]"
            />
            <SortHead
              label="Quality"
              sortBy="qualityOfLead"
              className="min-w-[100px]"
            />
            <SortHead
              label="Program Type"
              sortBy="programType"
              className="min-w-[100px]"
            />
            <SortHead
              label="Principal Name"
              sortBy="principalName"
              className="min-w-[150px]"
            />
            <SortHead
              label="Principal Contact"
              sortBy="principalContact"
              className="min-w-[150px]"
            />
            <SortHead
              label="Principal Email"
              sortBy="principalEmail"
              className="min-w-[200px]"
            />
            <SortHead
              label="Key Person Name"
              sortBy="keyPersonName"
              className="min-w-[150px]"
            />
            <SortHead
              label="Key Person Contact"
              sortBy="keyPersonContact"
              className="min-w-[150px]"
            />
            <SortHead
              label="Key Person Email"
              sortBy="keyPersonEmail"
              className="min-w-[200px]"
            />
            <SortHead
              label="No of Students"
              sortBy="noOfStudents"
              className="min-w-[120px]"
            />
            <SortHead
              label="Avg Fees Per Year"
              sortBy="avgFeesPerYear"
              className="min-w-[120px]"
            />
            <SortHead
              label="Annual Contract Value"
              sortBy="annualContractValue"
              className="min-w-[120px]"
            />
            <SortHead
              label="Sales Start Date"
              sortBy="salesStartDate"
              className="min-w-[120px]"
            />
            <SortHead
              label="Sales Closed Date"
              sortBy="salesClosedDate"
              className="min-w-[120px]"
            />
            <SortHead
              label="Lead Source"
              sortBy="leadSource"
              className="min-w-[120px]"
            />
            <SortHead
              label="Lead Remarks"
              sortBy="leadRemarks"
              className="min-w-[150px]"
            />
            <SortHead
              label="Team Remarks"
              sortBy="teamRemarks"
              className="min-w-[150px]"
            />

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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                </div>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            sortedLeads.map((l) => (
              <TableRow key={l._id}>
                <TableCell className="whitespace-nowrap">{l.leadNo}</TableCell>
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
                  {Array.isArray(l.leadRemarks) && l.leadRemarks.length > 0
                    ? l.leadRemarks[l.leadRemarks.length - 1]?.text
                    : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap max-w-[200px] truncate">
                  {l.teamRemarks || "-"}
                </TableCell>
                <TableCell className="text-right sticky right-0 bg-white z-10">
                  {canManageLead(l) ? (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView && onView(l)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
                        onClick={() => openStatusChangeDialog(l)}
                        aria-label={
                          l.isActive === false
                            ? "Activate lead"
                            : "Deactivate lead"
                        }
                      >
                        {l.isActive === false ? (
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        ) : (
                          <Archive className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

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
        open={!!pendingStatusChange}
        onOpenChange={(open) => !open && setPendingStatusChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusChange?.action === "deactivate"
                ? "Deactivate lead?"
                : "Activate lead?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusChange?.action === "deactivate"
                ? "This will archive the lead. Switch the Status filter to Archived to view it later."
                : "This will move the lead back to the Active list."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatusChange(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className={
                pendingStatusChange?.action === "deactivate"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {pendingStatusChange?.action === "deactivate"
                ? "Deactivate"
                : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}