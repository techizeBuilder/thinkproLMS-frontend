/** @format */

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

interface User {
  _id: string;
  name: string;
  role: string;
}

interface AttendanceRecord {
  user: User;
  date: string;
  punchIn?: string;
}

interface Holiday {
  date: string;
  title: string;
}

const TeamAttendance = () => {
  const today = new Date();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  /* ================= FETCH TEAM ATTENDANCE ================= */
  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await axios.get(`${API_BASE}/attendance/team`, {
        params: { month, year },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttendance(res.data || []);

     const uniqueUsers: User[] = Array.from(
       new Map(
         (res.data as AttendanceRecord[]).map(
           (r) => [r.user._id, r.user] as [string, User]
         )
       ).values()
     );

      setUsers(uniqueUsers);
    };

    fetchAttendance();
  }, [month, year]);

  /* ================= FETCH HOLIDAYS ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE}/holidays`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHolidays(res.data));
  }, []);

  /* ================= DAYS ================= */
  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [month, year]
  );

  const datesArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSunday = (day: number) => new Date(year, month, day).getDay() === 0;

  const getHoliday = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return holidays.find(
      (h) => new Date(h.date).toISOString().split("T")[0] === dateStr
    );
  };

  const isPresent = (userId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return attendance.some(
      (a) => a.user._id === userId && a.date === dateStr && a.punchIn
    );
  };

  const isFutureDate = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day > today.getDate();

  /* ================= MONTH CHANGE ================= */
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Team Attendance</h1>

          <div className="flex items-center gap-2">
            <ChevronLeft onClick={handlePrevMonth} className="cursor-pointer" />
            <span className="font-medium">
              {new Date(year, month).toLocaleString("default", {
                month: "long",
              })}{" "}
              {year}
            </span>
            <ChevronRight
              onClick={handleNextMonth}
              className="cursor-pointer"
            />
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-max border-collapse border text-sm">
            <thead>
              <tr>
                <th className="border px-3 py-2 sticky left-0 bg-white">
                  Employee
                </th>
                <th className="border px-3 py-2 sticky left-[140px] bg-white">
                  Role
                </th>

                {datesArray.map((day) => (
                  <th
                    key={day}
                    className={`border px-2 py-2 text-xs text-center
                      ${isSunday(day) ? "bg-gray-100 text-gray-500" : ""}
                      ${getHoliday(day) ? "bg-blue-100 text-blue-700" : ""}
                    `}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="border px-3 py-2 sticky left-0 bg-white font-medium">
                    {user.name}
                  </td>
                  <td className="border px-3 py-2 sticky left-[140px] bg-white">
                    {user.role}
                  </td>

                  {datesArray.map((day) => {
                    if (isFutureDate(day) || isSunday(day) || getHoliday(day)) {
                      return (
                        <td
                          key={day}
                          className="border text-center text-gray-300"
                        >
                          —
                        </td>
                      );
                    }

                    return (
                      <td key={day} className="border text-center py-2">
                        {isPresent(user._id, day) ? (
                          <CheckCircle
                            className="text-green-600 mx-auto"
                            size={18}
                          />
                        ) : (
                          <XCircle
                            className="text-red-500 mx-auto"
                            size={18}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamAttendance;
