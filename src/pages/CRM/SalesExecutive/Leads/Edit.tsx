import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService, type Lead } from "@/api/leadService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to check if user can edit a lead
const canEditLead = (lead: Lead, userId: string | undefined, userRole: string | undefined): boolean => {
  if (!userId || !lead) return false;
  
  // SuperAdmin can edit any lead
  if (userRole === "superadmin") return true;
  
  // Check if user is the creator
  const creatorId =
    typeof lead.createdBy === "string"
      ? lead.createdBy
      : lead.createdBy?._id;
  if (creatorId === userId) return true;
  
  // Check if user is assigned as TPA Sales POC (Executive)
  if (lead.salesExecutive) {
    const salesExec = typeof lead.salesExecutive === "object" ? lead.salesExecutive : null;
    if (salesExec?.user?._id === userId) return true;
  }
  
  // Check if user is assigned as TPA Sales POC (Manager)
  if (lead.salesManager) {
    const salesMgr = typeof lead.salesManager === "object" ? lead.salesManager : null;
    if (salesMgr?.user?._id === userId) return true;
  }
  
  // Check if user is assigned as Action on
  if (lead.actionOn && typeof lead.actionOn === "object") {
    if (lead.actionOn.user?._id === userId) return true;
  }
  
  return false;
};

export default function SEEditLeadPage() {
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
        
        if (!canEditLead(res.data, user?.id, user?.role)) {
          toast.error("You can only edit leads that you created or are assigned to");
          navigate(-1);
          return;
        }

        setLead(res.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load lead");
      }
    })();
  }, [id, loading, user?.id, user?.role, navigate]);

  const handleSubmit = async (payload: any) => {
    if (!id) return;
    try {
      setSaving(true);
      await leadService.update(id, payload);
      toast.success("Lead updated");
      navigate("/crm/sales-executive/leads");
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


