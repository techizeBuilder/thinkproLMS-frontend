/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService, type Lead } from "@/api/leadService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function SAViewLeadPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const { loading } = useAuth();

  useEffect(() => {
    (async () => {
      if (!id || loading) return;
      try {
        const res = await leadService.getById(id);
        setLead(res.data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load lead");
      }
    })();
  }, [id, loading]);

  return (
    <LeadPageForm
      lead={lead || undefined}
      readOnly
      onCancel={() => navigate(-1)}
    />
  );
}
