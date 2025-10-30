import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService } from "@/api/leadService";
import { toast } from "sonner";

export default function SMAddLeadPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (payload: any) => {
    try {
      setSaving(true);
      await leadService.create(payload);
      toast.success("Lead created");
      navigate("/crm/sales-manager/leads");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LeadPageForm onCancel={() => navigate(-1)} onSubmit={handleSubmit} saving={saving} />
  );
}


