/** @format */

import LeadsTable from "@/components/leads/LeadsTable";
import { useNavigate} from "react-router-dom";

export default function SASalesLeadsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <LeadsTable
        onAddNew={() => navigate("/crm/superadmin/leads/add")}
        onEdit={({ lead, fromUrl }) =>
          navigate(`/crm/superadmin/leads/${lead._id}/edit`, {
            state: { from: fromUrl },
          })
        }
        onView={(l) => navigate(`/crm/superadmin/leads/${l._id}/view`)}
      />
    </div>
  );
}
