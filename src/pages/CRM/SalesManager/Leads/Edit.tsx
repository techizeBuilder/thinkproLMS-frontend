import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService, type Lead } from "@/api/leadService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function SMEditLeadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    (async () => {
      if (!id || loading) return;
      try {
        const res = await leadService.getById(id);
        const creatorId =
          typeof res.data.createdBy === "string"
            ? res.data.createdBy
            : res.data.createdBy?._id;

        if (user?.id && creatorId !== user.id) {
          toast.error("You can only edit leads you created");
          navigate(-1);
          return;
        }

        setLead(res.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load lead");
      }
    })();
  }, [id, loading, user?.id, navigate]);

  const handleSubmit = async (payload: any) => {
    if (!id) return;
    try {
      setSaving(true);
      await leadService.update(id, payload);
      toast.success("Lead updated");
      navigate("/crm/sales-manager/leads");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LeadPageForm lead={lead || undefined} onCancel={() => navigate(-1)} onSubmit={handleSubmit} saving={saving} />
  );
}


