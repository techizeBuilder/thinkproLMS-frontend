/** @format */
export default function SelfAppraisalViewModal({ open, onClose, data }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 space-y-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Self Appraisal</h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <b>Goals Achievement:</b> {data.goalsAchievement}
          </p>

          <p>
            <b>Goals Rating:</b> {data.goalsRating}/5
          </p>

          <div>
            <b>Skills Rating:</b>
            <ul className="ml-4 list-disc">
              <li>Technical: {data.skillsRating.technical}</li>
              <li>Communication: {data.skillsRating.communication}</li>
              <li>Teamwork: {data.skillsRating.teamwork}</li>
              <li>Problem Solving: {data.skillsRating.problemSolving}</li>
            </ul>
          </div>

          <p>
            <b>Contributions:</b> {data.contributions}
          </p>

          <p>
            <b>Challenges:</b> {data.challenges}
          </p>

          <p>
            <b>Learning:</b> {data.learning}
          </p>

          <p>
            <b>Summary:</b> {data.summary}
          </p>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
