/** @format */

import { CheckCircle, XCircle } from "lucide-react";

const pipelineData = [
  {
    name: "Aman",
    applied: true,
    shortlisted: true,
    hrRound: true,
    techRound: false,
    offer: false,
    hired: false,
  },
  {
    name: "Rahul",
    applied: true,
    shortlisted: false,
    hrRound: false,
    techRound: false,
    offer: false,
    hired: false,
  },
];

const StatusIcon = ({ value }: { value: boolean }) => {
  return value ? (
    <CheckCircle className="text-green-500 mx-auto" size={20} />
  ) : (
    <XCircle className="text-red-400 mx-auto" size={20} />
  );
};

const InterviewPipeline = () => {
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Interview Pipeline</h1>
        <p className="text-sm text-gray-500">
          Recruitment &gt; Interview Pipeline
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Candidate</th>
              <th className="px-4 py-3">Applied</th>
              <th className="px-4 py-3">Shortlisted</th>
              <th className="px-4 py-3">HR Round</th>
              <th className="px-4 py-3">Tech Round</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Hired</th>
            </tr>
          </thead>

          <tbody>
            {pipelineData.map((c, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-3 text-left font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.applied} />
                </td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.shortlisted} />
                </td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.hrRound} />
                </td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.techRound} />
                </td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.offer} />
                </td>
                <td className="px-4 py-3">
                  <StatusIcon value={c.hired} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewPipeline;
