import { useEffect, useState } from "react";
import { leadService, type LeadPhaseSummaryItem } from "@/api/leadService";

export default function CRMSummaryPage() {
  const [rows, setRows] = useState<LeadPhaseSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await leadService.getPhaseSummary();
        if (!mounted) return;
        setRows(res.data || []);
      } catch (e) {
        setError("Failed to load summary");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Summary</h1>
      <div className="overflow-x-auto bg-white border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 border-b w-16">#</th>
              <th className="text-left px-4 py-2 border-b">Phase</th>
              <th className="text-right px-4 py-2 border-b w-40">
                No of Schools
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.order} className="odd:bg-white even:bg-gray-50">
                <td className="px-4 py-2 border-b align-top">
                  {r.order < 10 ? `0${r.order}` : r.order}
                </td>
                <td className="px-4 py-2 border-b align-top">{r.phase}</td>
                <td className="px-4 py-2 border-b text-right align-top">
                  {r.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
