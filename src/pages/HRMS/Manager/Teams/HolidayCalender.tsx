/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_URL;

interface Holiday {
  _id: string;
  title: string; // Holiday name
  date: string; // ISO date
}

export default function HolidayCalendar() {
  const token = localStorage.getItem("token");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${API_BASE}/holidays`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHolidays(res.data || []);
    } catch (error) {
      console.error("Failed to fetch holidays", error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Leave Calendar
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading holidays...</p>
          ) : holidays.length === 0 ? (
            <p className="text-sm text-gray-500">No holidays found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">No.</th>
                    <th className="border px-3 py-2 text-left">Holiday</th>
                    <th className="border px-3 py-2 text-left">Date</th>
                    <th className="border px-3 py-2 text-left">Day</th>
                  </tr>
                </thead>

                <tbody>
                  {holidays.map((h, index) => (
                    <tr key={h._id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2 font-medium">{h.title}</td>
                      <td className="border px-3 py-2">{formatDate(h.date)}</td>
                      <td className="border px-3 py-2">{getDayName(h.date)}</td>
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
