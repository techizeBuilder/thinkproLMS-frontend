/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

interface Candidate {
  _id: string;
  name: string;
  email: string;
  jobTitle: string;
  resumeUrl: string;
  status: string;
  createdAt: string;
}

const Candidates = () => {
  const token = localStorage.getItem("token");
  const [list, setList] = useState<Candidate[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const fetchCandidates = async () => {
    const res = await axios.get(`${API_BASE}/candidates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setList(res.data);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await axios.patch(
      `${API_BASE}/candidates/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCandidates();
  };

  const deleteCandidate = async (id: string) => {
    await axios.delete(`${API_BASE}/candidates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCandidates();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Candidates</h1>

      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-4 py-3 text-center">No.</th>
              <th>Candidate</th>
              <th>Email</th>
              <th>Job Title</th>
              <th>Resume</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((c,i) => (
              <tr key={c._id} className="border-t text-sm">
                <td className="px-4 py-3 text-center">{i + 1}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.jobTitle}</td>

                <td>
                  <a
                    href={c.resumeUrl}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View Resume
                  </a>
                </td>

                {/* STATUS DROPDOWN */}
                <td>
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option>Applied</option>
                    <option>Shortlisted</option>
                    <option>Rejected</option>
                    <option>Hired</option>
                  </select>
                </td>

                <td>{new Date(c.createdAt).toLocaleDateString()}</td>

                {/* ACTION */}
                <td className="relative">
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      setOpenMenu(openMenu === c._id ? null : c._id)
                    }
                  >
                    <MoreVertical size={18} />
                  </span>

                  {openMenu === c._id && (
                    <div className="absolute right-6 mt-2 w-28 bg-white border rounded shadow">
                      <button className="w-full px-3 py-2 text-left hover:bg-gray-100">
                        View
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-red-500 hover:bg-red-50"
                        onClick={() => deleteCandidate(c._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Candidates;
