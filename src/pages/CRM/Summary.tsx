import { useEffect, useMemo, useState } from "react";
import { leadService, type LeadPhaseSummaryItem } from "@/api/leadService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, endOfDay, startOfDay } from "date-fns";
import {
  locationService,
  type State as IndiaState,
} from "@/api/locationService";
import axiosInstance from "@/api/axiosInstance";

export default function CRMSummaryPage() {
  const [rows, setRows] = useState<LeadPhaseSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (mirroring LeadsTable)
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
  const [actionDueRange, setActionDueRange] = useState<{ from?: Date; to?: Date }>({});

  const [indiaStates, setIndiaStates] = useState<IndiaState[]>([]);
  const [managers, setManagers] = useState<Array<{ _id: string; name: string }>>([]);
  const [executives, setExecutives] = useState<Array<{ _id: string; name: string }>>([]);

  const debouncedSearch = useDebounce(search, 400);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await leadService.getPhaseSummary({
        search: debouncedSearch || undefined,
        state: stateFilter && stateFilter !== "all" ? stateFilter : undefined,
        district: districtFilter || undefined,
        city: cityFilter || undefined,
        phase: phaseFilter !== "all" ? phaseFilter : undefined,
        quality: qualityFilter !== "all" ? qualityFilter : undefined,
        programType: programFilter !== "all" ? programFilter : undefined,
        leadSource: leadSourceFilter !== "all" ? leadSourceFilter : undefined,
        deliveryModel: deliveryModelFilter !== "all" ? deliveryModelFilter : undefined,
        salesCycle: salesCycleFilter !== "all" ? salesCycleFilter : undefined,
        boardAffiliated: boardFilter !== "all" ? boardFilter : undefined,
        pocRole: pocRoleFilter !== "all" ? pocRoleFilter : undefined,
        actionOn: actionOnFilter !== "all" ? actionOnFilter : undefined,
        actionDueDateFrom: actionDueDateFrom ? startOfDay(new Date(actionDueDateFrom)).toISOString() : undefined,
        actionDueDateTo: actionDueDateTo ? endOfDay(new Date(actionDueDateTo)).toISOString() : undefined,
        actionDueDate: actionDueDateExact || undefined,
      });
        setRows(res.data || []);
      } catch (e) {
        setError("Failed to load summary");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSummary();
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
  ]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await locationService.getStates();
        setIndiaStates(states);
      } catch {}
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
        setManagers((mgrRes.data?.data || []).map((m: any) => ({ _id: m._id, name: m.name })));
        setExecutives((execRes.data?.data || []).map((e: any) => ({ _id: e._id, name: e.name })));
      } catch {}
    })();
  }, []);

  const states = useMemo(() => indiaStates.map((s) => s.name).sort(), [indiaStates]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Summary</h1>
          <p className="text-[var(--muted-foreground)]">Phase-wise count of filtered leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[var(--stem-science)] text-white border-[var(--stem-science)] hover:bg-[var(--stem-mathematics)] hover:border-[var(--stem-mathematics)]"
            onClick={async () => {
              const params: any = {
                search: debouncedSearch || undefined,
                state: stateFilter && stateFilter !== "all" ? stateFilter : undefined,
                district: districtFilter || undefined,
                city: cityFilter || undefined,
                phase: phaseFilter !== "all" ? phaseFilter : undefined,
                quality: qualityFilter !== "all" ? qualityFilter : undefined,
                programType: programFilter !== "all" ? programFilter : undefined,
                leadSource: leadSourceFilter !== "all" ? leadSourceFilter : undefined,
                deliveryModel: deliveryModelFilter !== "all" ? deliveryModelFilter : undefined,
                salesCycle: salesCycleFilter !== "all" ? salesCycleFilter : undefined,
                boardAffiliated: boardFilter !== "all" ? boardFilter : undefined,
                pocRole: pocRoleFilter !== "all" ? pocRoleFilter : undefined,
                actionOn: actionOnFilter !== "all" ? actionOnFilter : undefined,
                actionDueDateFrom: actionDueDateFrom ? startOfDay(new Date(actionDueDateFrom)).toISOString() : undefined,
                actionDueDateTo: actionDueDateTo ? endOfDay(new Date(actionDueDateTo)).toISOString() : undefined,
                actionDueDate: actionDueDateExact || undefined,
              };
              const query = new URLSearchParams(
                Object.entries(params).reduce((acc: any, [k, v]) => {
                  if (v !== undefined && v !== "") acc[k] = String(v);
                  return acc;
                }, {})
              ).toString();
              const url = `/leads/summary/export${query ? `?${query}` : ""}`;
              const resp = await axiosInstance.get(url, { responseType: "blob" });
              const blob = new Blob([resp.data], { type: resp.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "phase-summary.xlsx";
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters (same as LeadsTable) */}
      <div className="flex flex-col gap-2 items-start">
        {/* Row 1 */}
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

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
          <div className="space-y-1 sm:space-y-2">
            <Label>Action Due Date</Label>
            <Popover open={actionDueOpen} onOpenChange={setActionDueOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(() => {
                    if (actionDueDateExact) {
                      return `${format(new Date(actionDueDateExact), "MMM dd, yyyy")}`;
                    }
                    if (actionDueDateFrom && actionDueDateTo) {
                      return `${format(new Date(actionDueDateFrom), "MMM dd, yyyy")} - ${format(new Date(actionDueDateTo), "MMM dd, yyyy")}`;
                    }
                    if (actionDueDateFrom && !actionDueDateTo) {
                      return `${format(new Date(actionDueDateFrom), "MMM dd, yyyy")} -`;
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
                        const sameDay = from.toDateString() === to.toDateString();
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
                    <Button onClick={() => setActionDueOpen(false)}>Apply</Button>
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
            <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
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
            <Select value={deliveryModelFilter} onValueChange={setDeliveryModelFilter}>
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
            <Select value={salesCycleFilter} onValueChange={setSalesCycleFilter}>
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
                {["CBSE", "ICSE", "State Board", "IGCSE", "IB", "Other"].map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {rows.map((r) => (
          <div
            key={r.order}
            className="rounded-lg border bg-card border-[var(--border)] p-4 hover:shadow-md transition-all duration-200 hover:border-[var(--stem-engineering)]"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white bg-[var(--stem-engineering)] px-2 py-1 rounded-md min-w-[2rem] text-center">
                  {r.order < 10 ? `0${r.order}` : r.order}
                </span>
                <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight line-clamp-2">
                  {r.phase}
                </h3>
              </div>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <div className="text-2xl font-bold text-[var(--stem-science)]">
                  {r.count}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Schools
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
