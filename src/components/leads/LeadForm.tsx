import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadService, type Lead } from "@/api/leadService";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead | null;
  onSaved?: (lead: Lead) => void;
}

type SalesManager = { _id: string; name: string; email: string };
type SalesExecutive = {
  _id: string;
  name: string;
  email: string;
  manager?: SalesManager | null;
};

export default function LeadForm({
  open,
  onOpenChange,
  lead,
  onSaved,
}: LeadFormProps) {
  const isEdit = Boolean(lead?._id);
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState<SalesManager[]>([]);
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);
  const [form, setForm] = useState<any>({
    schoolName: "",
    postalAddress: "",
    city: "",
    state: "",
    district: "",
    pinCode: "",
    boardAffiliated: "CBSE",
    principalName: "",
    principalContact: "",
    principalEmail: "",
    schoolEmail: "",
    schoolWebsite: "",
    keyPersonName: "",
    keyPersonContact: "",
    keyPersonEmail: "",
    roboticsAtlPresent: "No",
    noOfStudents: "",
    avgFeesPerYear: "",
    qualified: "No",
    salesExecutive: "",
    salesManager: "",
    leadSource: "Internal",
    leadRemarks: "",
    phase: "Lead",
    programType: "Pilot",
    qualityOfLead: "Cold",
    deliveryModel: "TPA Managed",
    salesStartDate: "",
    salesClosedDate: "",
    salesCycle: "2025-2026",
    teamRemarks: "",
    actionNeeded: "",
    actionOn: "",
    actionDueDate: "",
    annualContractValue: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const [mgrRes, execRes] = await Promise.all([
          axiosInstance.get("/sales/managers"),
          axiosInstance.get("/sales/executives"),
        ]);
        setManagers(mgrRes.data.data || []);
        setExecutives(execRes.data.data || []);
      } catch {
        // noop
      }
    })();
  }, []);

  useEffect(() => {
    if (!lead) return;
    setForm({
      ...form,
      ...lead,
      noOfStudents: lead.noOfStudents ?? "",
      avgFeesPerYear: lead.avgFeesPerYear ?? "",
      annualContractValue: lead.annualContractValue ?? "",
      salesStartDate: lead.salesStartDate
        ? lead.salesStartDate.substring(0, 10)
        : "",
      salesClosedDate: lead.salesClosedDate
        ? lead.salesClosedDate.substring(0, 10)
        : "",
      actionDueDate: lead.actionDueDate
        ? lead.actionDueDate.substring(0, 10)
        : "",
      // Handle actionOn: if it's an object (populated), extract _id; otherwise use as is
      actionOn: (lead.actionOn && typeof lead.actionOn === 'object' && '_id' in lead.actionOn && 'name' in lead.actionOn)
        ? lead.actionOn._id
        : (typeof lead.actionOn === 'string' ? lead.actionOn : "none"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: string, value: string) =>
    setForm((p: any) => ({ ...p, [name]: value }));

  const handleSave = async () => {
    if (!form.schoolName?.trim()) {
      toast.error("School Name is required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        noOfStudents: form.noOfStudents ? Number(form.noOfStudents) : null,
        avgFeesPerYear: form.avgFeesPerYear
          ? Number(form.avgFeesPerYear)
          : null,
        annualContractValue: form.annualContractValue
          ? Number(form.annualContractValue)
          : null,
        salesStartDate: form.salesStartDate || null,
        salesClosedDate: form.salesClosedDate || null,
        actionDueDate: form.actionDueDate || null,
      };
      if (payload.actionOn === "none") payload.actionOn = null;
      let res;
      if (isEdit && lead?._id)
        res = await leadService.update(lead._id, payload);
      else res = await leadService.create(payload);
      toast.success(isEdit ? "Lead updated" : "Lead created");
      onSaved && onSaved(res.data);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const dateField = (label: string, name: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {form[name] ? format(new Date(form[name]), "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar
            mode="single"
            selected={form[name] ? new Date(form[name]) : undefined}
            onSelect={(d: any) =>
              handleSelect(name, d ? d.toISOString().slice(0, 10) : "")
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit Lead ${lead?.leadNo}` : "Create Lead"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">School Details</h3>
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  name="schoolName"
                  value={form.schoolName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Address</Label>
                <Input
                  name="postalAddress"
                  value={form.postalAddress}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City / Town</Label>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={form.state}
                    onValueChange={(v) => handleSelect("state", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Let user type free-form state if API not available */}
                      {[
                        "Andhra Pradesh",
                        "Bihar",
                        "Delhi",
                        "Gujarat",
                        "Karnataka",
                        "Maharashtra",
                        "Rajasthan",
                        "Tamil Nadu",
                        "Telangana",
                        "Uttar Pradesh",
                        "West Bengal",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>PIN Code</Label>
                  <Input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Board Affiliated</Label>
                <Select
                  value={form.boardAffiliated}
                  onValueChange={(v) => handleSelect("boardAffiliated", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "CBSE",
                      "ICSE",
                      "State Board",
                      "IGCSE",
                      "IB",
                      "Other",
                    ].map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>School Website</Label>
                <Input
                  name="schoolWebsite"
                  value={form.schoolWebsite}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Principal Name</Label>
                  <Input
                    name="principalName"
                    value={form.principalName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Principal Contact</Label>
                  <Input
                    name="principalContact"
                    value={form.principalContact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Principal Email</Label>
                  <Input
                    name="principalEmail"
                    value={form.principalEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>School Email</Label>
                  <Input
                    name="schoolEmail"
                    value={form.schoolEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Person Name</Label>
                  <Input
                    name="keyPersonName"
                    value={form.keyPersonName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Person Contact</Label>
                  <Input
                    name="keyPersonContact"
                    value={form.keyPersonContact}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Key Person Email</Label>
                  <Input
                    name="keyPersonEmail"
                    value={form.keyPersonEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h3 className="font-semibold">Qualification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Robotics / ATL Present?</Label>
                  <Select
                    value={form.roboticsAtlPresent}
                    onValueChange={(v) => handleSelect("roboticsAtlPresent", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>No of Students</Label>
                  <Input
                    name="noOfStudents"
                    value={form.noOfStudents}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avg Fees Per Year</Label>
                  <Input
                    name="avgFeesPerYear"
                    value={form.avgFeesPerYear}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qualified?</Label>
                  <Select
                    value={form.qualified}
                    onValueChange={(v) => handleSelect("qualified", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="font-semibold">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TPA Sales POC (Executive)</Label>
                  <Select
                    value={form.salesExecutive}
                    onValueChange={(v) => handleSelect("salesExecutive", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Executive" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {executives.map((e) => (
                        <SelectItem key={e._id} value={e._id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TPA Sales POC (Manager)</Label>
                  <Select
                    value={form.salesManager}
                    onValueChange={(v) => handleSelect("salesManager", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {managers.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="font-semibold">Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <Select
                    value={form.leadSource}
                    onValueChange={(v) => handleSelect("leadSource", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lead Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Channel Partner">
                        Channel Partner
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select
                    value={form.phase}
                    onValueChange={(v) => handleSelect("phase", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="space-y-2">
                  <Label>Pilot / Full Program</Label>
                  <Select
                    value={form.programType}
                    onValueChange={(v) => handleSelect("programType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Program Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pilot">Pilot</SelectItem>
                      <SelectItem value="Full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quality Of Lead</Label>
                  <Select
                    value={form.qualityOfLead}
                    onValueChange={(v) => handleSelect("qualityOfLead", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cold">Cold</SelectItem>
                      <SelectItem value="Warm">Warm</SelectItem>
                      <SelectItem value="Hot">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  {dateField("Sales Start Date", "salesStartDate")}
                </div>
                <div className="space-y-2">
                  {dateField("Sales Closed Date", "salesClosedDate")}
                </div>
                <div className="space-y-2">
                  <Label>Sales Cycle</Label>
                  <Select
                    value={form.salesCycle}
                    onValueChange={(v) => handleSelect("salesCycle", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sales Cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {["2025-2026", "2026-2027"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="font-semibold">Notes & Actions</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Lead Remarks</Label>
                  <Textarea
                    name="leadRemarks"
                    value={form.leadRemarks}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Remarks - From Team</Label>
                  <Textarea
                    name="teamRemarks"
                    value={form.teamRemarks}
                    onChange={handleChange}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Action needed - From Team</Label>
                    <Input
                      name="actionNeeded"
                      value={form.actionNeeded}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    {dateField("Action Due date", "actionDueDate")}
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Action On</Label>
                    <Select
                      value={form.actionOn || "none"}
                      onValueChange={(v) => handleSelect("actionOn", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sales Manager or Executive" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Managers</SelectLabel>
                          {managers.map((m) => (
                            <SelectItem key={`manager-${m._id}`} value={m._id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Executives</SelectLabel>
                          {executives.map((e) => (
                            <SelectItem key={`exec-${e._id}`} value={e._id}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label>Annual Contract Value (INR)</Label>
                    <Input
                      name="annualContractValue"
                      value={form.annualContractValue}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Lead"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
