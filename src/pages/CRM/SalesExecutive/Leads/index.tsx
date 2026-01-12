import LeadsTable from "@/components/leads/LeadsTable";
import { useNavigate } from "react-router-dom";

export default function SESalesLeadsPage() {
	const navigate = useNavigate();
	return (
    <div className="p-6">
      <LeadsTable
        onAddNew={() => navigate("/crm/sales-executive/leads/add")}
        onEdit={(payload) =>
          navigate(`/crm/sales-executive/leads/${payload.lead._id}/edit`, {
            state: { from: payload.fromUrl },
          })
        }
      />
    </div>
  );
}


