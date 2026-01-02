/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_URL;

interface TeamMember {
  _id: string;
  name: string;
  employeeId: string;
  role: string;
  departmentId?: {
    name: string;
  };
  status: string;
  managerId: {
    _id: string;
    name?: string;
  };
}

export default function TeamMembers() {
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInManagerId = loggedInUser?.id;
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

   const filteredTeam = res.data.filter((user: TeamMember) => {
     return user.managerId?._id === loggedInManagerId;
   });   
      setTeam(filteredTeam);
    } catch (err) {
      console.error("Failed to fetch team members", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading team members...</p>
          ) : team.length === 0 ? (
            <p className="text-sm text-gray-500">
              No team members assigned to you.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Emp ID
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Department
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {team.map((emp) => (
                    <tr key={emp._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2">{emp.employeeId}</td>
                      <td className="px-4 py-2 capitalize">{emp.role}</td>
                      <td className="px-4 py-2">
                        {emp.departmentId?.name || "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            emp.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
