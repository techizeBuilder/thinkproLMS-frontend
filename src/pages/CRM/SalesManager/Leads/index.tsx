import LeadsTable from "@/components/leads/LeadsTable";
import { useNavigate } from "react-router-dom";

export default function SMSalesLeadsPage() {
	const navigate = useNavigate();
	return (
		<div className="p-6">
			<LeadsTable onAddNew={() => navigate("/crm/sales-manager/leads/add")} onEdit={(l) => navigate(`/crm/sales-manager/leads/${l._id}/edit`)} />
		</div>
	);
}


