import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService, type Lead } from "@/api/leadService";
import { toast } from "sonner";

export default function SMEditLeadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await leadService.getById(id);
        setLead(res.data);
      } catch {
        toast.error("Failed to load lead");
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: any) => {
    if (!id) return;
    try {
      setSaving(true);
      await leadService.update(id, payload);
      toast.success("Lead updated");
      navigate("/crm/sales-manager/leads");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LeadPageForm lead={lead || undefined} onCancel={() => navigate(-1)} onSubmit={handleSubmit} saving={saving} />
  );
}


