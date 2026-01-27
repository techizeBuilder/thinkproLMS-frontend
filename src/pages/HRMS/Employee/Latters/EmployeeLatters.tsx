/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../Loader";

const API = import.meta.env.VITE_API_URL;
const ViewAPI = API.replace("/api", "");

type LetterType = "OFFER" | "EXPERIENCE" | "TRAINING";

interface Letter {
  _id: string;
  letterType: LetterType;
  fileName: string;
  originalName: string;
  filePath: string;
  message?: string;
  createdAt: string;
  sentBy: {
    name: string;
    role: string;
  };
}

const TABS: { label: string; value: LetterType }[] = [
  { label: "Offer Letter", value: "OFFER" },
  { label: "Experience Letter", value: "EXPERIENCE" },
  { label: "Training Letter", value: "TRAINING" },
];

export default function EmployeeLetters() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<LetterType>("OFFER");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/letters/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLetters(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const filteredLetters = letters.filter((l) => l.letterType === activeTab);

  const handleDownload = (filePath: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = `${ViewAPI}/${filePath}`;
    link.setAttribute("download", originalName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if(loading)return<Loader/>;
  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold mb-6">My Letters</h1>

      {/* TABS */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
              ${
                activeTab === tab.value
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center text-gray-500 mt-10">
          Loading letters...
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No letters found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLetters.map((letter) => (
            <div
              key={letter._id}
              className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {letter.letterType.replace("_", " ")} LETTER
                  </h3>
                  <p className="text-xs text-gray-500">
                    Issued on {new Date(letter.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  GENERATED
                </span>
              </div>

              {/* MESSAGE */}
              <div className="text-sm text-gray-600 mb-4">
                {letter.message || "Official company letter"}
              </div>

              {/* META */}
              <div className="text-xs text-gray-500 mb-4">
                Issued by:{" "}
                <span className="font-medium">{letter.sentBy?.name}</span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">
                <a
                  href={`${ViewAPI}/${letter.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center text-sm py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  View
                </a>

                <button
                  onClick={() =>
                    handleDownload(letter.filePath, letter.originalName)
                  }
                  className="flex-1 text-sm py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
