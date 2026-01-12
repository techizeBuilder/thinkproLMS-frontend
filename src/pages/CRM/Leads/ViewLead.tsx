/** @format */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeadPageForm from "@/components/leads/LeadPageForm";
import { leadService, type Lead } from "@/api/leadService";
import { toast } from "sonner";

export default function ViewLeadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await leadService.getById(id);
        setLead(res.data);
      } catch (err: any) {
        toast.error("Failed to load lead");
      }
    })();
  }, [id]);

  return <LeadPageForm lead={lead} readOnly onCancel={() => navigate(-1)} />;
}
