import { useEffect, useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import axiosInstance from "@/api/axiosInstance";
import { type Lead } from "@/api/leadService";
import { isValidPhoneNumber, getPhoneNumberError } from "@/utils/validation";

type SalesManager = { _id: string; name: string; email: string };
type SalesExecutive = { _id: string; name: string; email: string };

interface LeadPageFormProps {
  lead?: Lead | null;
  saving?: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void> | void;
}

export default function LeadPageForm({
  lead,
  saving = false,
  onCancel,
  onSubmit,
}: LeadPageFormProps) {
  const isEdit = Boolean(lead?._id);
  const [managers, setManagers] = useState<SalesManager[]>([]);
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);
  const [principalPhoneError, setPrincipalPhoneError] = useState<string | null>(
    null
  );
  const [keyPersonPhoneError, setKeyPersonPhoneError] = useState<string | null>(
    null
  );
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
    salesExecutive: "none",
    salesManager: "none",
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
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!lead) return;
    setForm((prev: any) => ({
      ...prev,
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
      salesExecutive:
        (lead as any).salesExecutive &&
        typeof (lead as any).salesExecutive === "object" &&
        "_id" in (lead as any).salesExecutive
          ? (lead as any).salesExecutive._id
          : typeof (lead as any).salesExecutive === "string" &&
            (lead as any).salesExecutive
          ? (lead as any).salesExecutive
          : "none",
      salesManager:
        (lead as any).salesManager &&
        typeof (lead as any).salesManager === "object" &&
        "_id" in (lead as any).salesManager
          ? (lead as any).salesManager._id
          : typeof (lead as any).salesManager === "string" &&
            (lead as any).salesManager
          ? (lead as any).salesManager
          : "none",
      // Handle actionOn: if it's an object (populated), extract _id; otherwise use as is
      actionOn:
        lead.actionOn &&
        typeof lead.actionOn === "object" &&
        "_id" in lead.actionOn &&
        "name" in lead.actionOn
          ? lead.actionOn._id
          : typeof lead.actionOn === "string"
          ? lead.actionOn
          : "none",
    }));
  }, [lead?._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    if (name === "principalContact") {
      setPrincipalPhoneError(getPhoneNumberError(value));
    }
    if (name === "keyPersonContact") {
      setKeyPersonPhoneError(getPhoneNumberError(value));
    }
  };
  const handleSelect = (name: string, value: string) =>
    setForm((p: any) => ({ ...p, [name]: value }));

  const isEmail = (v: string) =>
    /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
      v
    );
  const isUrl = (v: string) => {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };
  const isDigits = (v: string, len?: number) =>
    /^\d+$/.test(v) && (len ? v.length === len : true);

  const submit = async () => {
    if (!form.schoolName?.trim()) {
      alert("School Name is required");
      return;
    }
    if (form.principalEmail && !isEmail(form.principalEmail)) {
      alert("Enter a valid Principal Email");
      return;
    }
    if (form.schoolEmail && !isEmail(form.schoolEmail)) {
      alert("Enter a valid School Email");
      return;
    }
    if (form.keyPersonEmail && !isEmail(form.keyPersonEmail)) {
      alert("Enter a valid Key Person Email");
      return;
    }
    if (form.schoolWebsite && !isUrl(form.schoolWebsite)) {
      alert("Enter a valid School Website URL");
      return;
    }
    if (form.pinCode && !isDigits(form.pinCode, 6)) {
      alert("PIN Code must be 6 digits");
      return;
    }
    if (form.principalContact && !isValidPhoneNumber(form.principalContact)) {
      alert("Please enter a valid Principal Contact number");
      return;
    }
    if (form.keyPersonContact && !isValidPhoneNumber(form.keyPersonContact)) {
      alert("Please enter a valid Key Person Contact number");
      return;
    }
    if (form.noOfStudents && Number(form.noOfStudents) < 0) {
      alert("No of Students cannot be negative");
      return;
    }
    if (form.avgFeesPerYear && Number(form.avgFeesPerYear) < 0) {
      alert("Avg Fees cannot be negative");
      return;
    }
    if (form.annualContractValue && Number(form.annualContractValue) < 0) {
      alert("Annual Contract Value cannot be negative");
      return;
    }
    if (
      form.salesStartDate &&
      form.salesClosedDate &&
      new Date(form.salesStartDate) > new Date(form.salesClosedDate)
    ) {
      alert("Sales Closed Date cannot be before Sales Start Date");
      return;
    }
    const payload: any = {
      ...form,
      noOfStudents: form.noOfStudents ? Number(form.noOfStudents) : null,
      avgFeesPerYear: form.avgFeesPerYear ? Number(form.avgFeesPerYear) : null,
      annualContractValue: form.annualContractValue
        ? Number(form.annualContractValue)
        : null,
      salesStartDate: form.salesStartDate || null,
      salesClosedDate: form.salesClosedDate || null,
      actionDueDate: form.actionDueDate || null,
    };
    if (payload.actionOn === "none") payload.actionOn = null;
    if (payload.salesExecutive === "none") payload.salesExecutive = null;
    if (payload.salesManager === "none") payload.salesManager = null;
    await onSubmit(payload);
  };

  const dateField = (label: string, name: string) => (
    <div className="space-y-2">
      <Label className="block">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {form[name] ? format(new Date(form[name]), "PPP") : `Pick ${label}`}
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
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? `Edit Lead ${lead?.leadNo}` : "Create Lead"}
          </h1>
          <p className="text-gray-600">Fill the details below.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">School Details</h3>
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                name="schoolName"
                placeholder="e.g. Springfield High School"
                value={form.schoolName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Postal Address</Label>
              <Input
                name="postalAddress"
                placeholder="Street, Area, Landmark"
                value={form.postalAddress}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City / Town</Label>
                <Input
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  name="district"
                  placeholder="e.g. Bengaluru Urban"
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
                  placeholder="6-digit PIN"
                  inputMode="numeric"
                  pattern="\\d*"
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
            <div className="space-y-2">
              <Label>School Website</Label>
              <Input
                name="schoolWebsite"
                placeholder="https://example.edu"
                type="url"
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
                  placeholder="e.g. Dr. A. Sharma"
                  value={form.principalName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Principal Contact</Label>
                <Input
                  name="principalContact"
                  placeholder="e.g. +91 98xxxxxxx"
                  type="tel"
                  value={form.principalContact}
                  onChange={handleChange}
                  className={principalPhoneError ? "border-red-500" : ""}
                />
                {principalPhoneError && (
                  <p className="text-sm text-red-500">{principalPhoneError}</p>
                )}
                {!principalPhoneError && form.principalContact && (
                  <p className="text-xs text-green-600">✓ Valid phone number</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Principal Email</Label>
                <Input
                  name="principalEmail"
                  placeholder="principal@school.edu"
                  type="email"
                  value={form.principalEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>School Email</Label>
                <Input
                  name="schoolEmail"
                  placeholder="info@school.edu"
                  type="email"
                  value={form.schoolEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Key Person Name</Label>
                <Input
                  name="keyPersonName"
                  placeholder="e.g. Ms. K. Rao"
                  value={form.keyPersonName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Key Person Contact</Label>
                <Input
                  name="keyPersonContact"
                  placeholder="e.g. +91 9xxxxxxxxx"
                  type="tel"
                  value={form.keyPersonContact}
                  onChange={handleChange}
                  className={keyPersonPhoneError ? "border-red-500" : ""}
                />
                {keyPersonPhoneError && (
                  <p className="text-sm text-red-500">{keyPersonPhoneError}</p>
                )}
                {!keyPersonPhoneError && form.keyPersonContact && (
                  <p className="text-xs text-green-600">✓ Valid phone number</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Key Person Email</Label>
                <Input
                  name="keyPersonEmail"
                  placeholder="key.person@school.edu"
                  type="email"
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
                  placeholder="e.g. 500"
                  type="number"
                  min="0"
                  value={form.noOfStudents}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Avg Fees Per Year</Label>
                <Input
                  name="avgFeesPerYear"
                  placeholder="e.g. 45000"
                  type="number"
                  min="0"
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
                    <SelectItem value="none">None</SelectItem>
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
                    <SelectItem value="none">None</SelectItem>
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
                <Label>Delivery Model</Label>
                <Select
                  value={form.deliveryModel}
                  onValueChange={(v) => handleSelect("deliveryModel", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Delivery Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {["TPA Managed", "School Managed", "Hybrid"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
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

              <div className="space-y-2">
                {dateField("Sales Start Date", "salesStartDate")}
              </div>
              <div className="space-y-2">
                {dateField("Sales Closed Date", "salesClosedDate")}
              </div>
            </div>

            <h3 className="font-semibold">Notes & Actions</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Lead Remarks</Label>
                <Textarea
                  name="leadRemarks"
                  placeholder="Key notes about this lead..."
                  value={form.leadRemarks}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks - From Team</Label>
                <Textarea
                  name="teamRemarks"
                  placeholder="e.g. Follow-up notes, meeting minutes..."
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
                    placeholder="e.g. Call Principal for demo scheduling"
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
                    placeholder="e.g. 250000"
                    type="number"
                    min="0"
                    value={form.annualContractValue}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Lead"}
          </Button>
        </div>
      </div>
    </div>
  );
}
