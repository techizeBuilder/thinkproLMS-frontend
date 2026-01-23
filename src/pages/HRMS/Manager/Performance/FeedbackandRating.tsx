/** @format */
import { useEffect, useState } from "react";
import axios from "axios";
import FeedbackModal from "./FeedbackModal";
import SelfAppraisalViewModal from "./SelfAppraisalViewModal";
import Loader from "../../Loader";

const API = import.meta.env.VITE_API_URL;

/* ⭐ Overall Rating Calculate */
const calculateOverallRating = (item: any) => {
  const total =
    item.goalsRating +
    item.skillsRating.technical +
    item.skillsRating.communication +
    item.skillsRating.teamwork +
    item.skillsRating.problemSolving;

  return Number((total / 5).toFixed(1));
};

/* ⭐ Star Component */
const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-yellow-400 text-sm">
      {"★".repeat(full)}
      <span className="text-gray-300">{"★".repeat(5 - full)}</span>
      <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
    </div>
  );
};

export default function FeedbackAndRatings() {
  const token = localStorage.getItem("token");

  const [list, setList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [viewSelf, setViewSelf] = useState<any>(null);
  const [loading,setLoading]=useState(true);
  const fetchList = async () => {
    const res = await axios.get(`${API}/feedback/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setList(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);
  if(loading)return<Loader/>;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Ratings & Feedback</h1>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {list.map((item) => {
          const overallRating = calculateOverallRating(item);

          return (
            <div
              key={item.selfAppraisalId}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* TOP INFO */}
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800 text-base">
                  {item.employee.name}
                </h3>

                <p className="text-xs text-gray-500">
                  Appraisal: {item.appraisal.title}
                </p>

                <StarRating rating={overallRating} />

                <p className="text-xs text-gray-600 line-clamp-2">
                  <span className="font-medium">Employee Comment:</span>{" "}
                  {item.summary}
                </p>

                <p className="text-[11px] text-gray-400">
                  Submitted on {new Date(item.submittedAt).toLocaleDateString()}
                </p>

                <span
                  className={`inline-block text-[11px] px-2 py-1 rounded-full ${
                    item.status === "REVIEWED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* BUTTONS BOTTOM */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setViewSelf(item)}
                  className="flex-1 text-xs px-3 py-2 rounded-md border hover:bg-gray-100"
                >
                  View Self Appraisal
                </button>

                <button
                  onClick={() => setSelected(item)}
                  className={`flex-1 text-xs px-3 py-2 rounded-md text-white ${
                    item.status === "REVIEWED"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-primary hover:opacity-90"
                  }`}
                >
                  {item.status === "REVIEWED"
                    ? "View Feedback"
                    : "Give Feedback"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No appraisals pending
        </div>
      )}

      {/* VIEW SELF APPRAISAL MODAL */}
      {viewSelf && (
        <SelfAppraisalViewModal
          open={true}
          data={viewSelf}
          onClose={() => setViewSelf(null)}
        />
      )}

      {/* GIVE FEEDBACK MODAL */}
      {selected && (
        <FeedbackModal
          open={true}
          onClose={() => {
            setSelected(null);
            fetchList();
          }}
          selfAppraisalId={selected.selfAppraisalId}
          readOnly={selected.status === "REVIEWED"}
        />
      )}
    </div>
  );
}
