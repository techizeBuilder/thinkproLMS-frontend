/** @format */

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Play,  LogIn, LogOut, Coffee,  } from "lucide-react";
import Loader from "../../Loader";

const API = import.meta.env.VITE_API_URL;

interface AttendanceLog {
  date: string;
  punchIn?: string;
  punchOut?: string;
  breakTime: number; // seconds
  workTime: number; // seconds
}

export default function MarkAttendance() {
  const token = localStorage.getItem("token");

  /* ================= STATE ================= */

  const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null);
  const [history, setHistory] = useState<AttendanceLog[]>([]);
  const [workingSeconds, setWorkingSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);

  const [isWorking, setIsWorking] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [loading,setLoading]=useState(true);

  const workTimer = useRef<NodeJS.Timeout | null>(null);
  const breakTimer = useRef<NodeJS.Timeout | null>(null);

  /* ================= AXIOS ================= */

  const api = axios.create({
    baseURL: API,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* ================= TIMER EFFECT ================= */

  useEffect(() => {
    if (isWorking && !onBreak) {
      workTimer.current = setInterval(() => {
        setWorkingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (workTimer.current) clearInterval(workTimer.current);
    };
  }, [isWorking, onBreak]);

  useEffect(() => {
    if (onBreak) {
      breakTimer.current = setInterval(() => {
        setBreakSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (breakTimer.current) clearInterval(breakTimer.current);
    };
  }, [onBreak]);

  /* ================= HELPERS ================= */

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  /* ================= FETCH HISTORY ================= */

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    const res = await api.get("/attendance/me");

    const records: AttendanceLog[] = res.data.map((a: any) => ({
      date: a.date,
      punchIn: a.punchIn ? new Date(a.punchIn).toLocaleTimeString() : undefined,
      punchOut: a.punchOut
        ? new Date(a.punchOut).toLocaleTimeString()
        : undefined,
      breakTime: a.totalBreakSeconds,
      workTime: a.totalWorkSeconds,
    }));

    setHistory(records);
    setLoading(false);

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = res.data.find((a: any) => a.date === today);

    if (todayRecord) {
      setTodayLog({
        date: todayRecord.date,
        punchIn: todayRecord.punchIn
          ? new Date(todayRecord.punchIn).toLocaleTimeString()
          : undefined,
        punchOut: todayRecord.punchOut
          ? new Date(todayRecord.punchOut).toLocaleTimeString()
          : undefined,
        breakTime: todayRecord.totalBreakSeconds,
        workTime: todayRecord.totalWorkSeconds,
      });

      setWorkingSeconds(todayRecord.totalWorkSeconds || 0);
      setBreakSeconds(todayRecord.totalBreakSeconds || 0);

      if (todayRecord.punchIn && !todayRecord.punchOut) {
        setIsWorking(true);
      }
    }
  };

  /* ================= ACTIONS ================= */

const punchIn = async () => {
  await api.post("/attendance/punch-in");

  const now = new Date().toLocaleTimeString();

  // 🔹 1️⃣ today log set
  setTodayLog({
    date: new Date().toLocaleDateString(),
    punchIn: now,
    breakTime: 0,
    workTime: 0,
  });

  // 🔹 2️⃣ 👇 YAHI ADD KARNA THA (TABLE ENTRY KE LIYE)
  setHistory((prev) => {
    const exists = prev.find((h) => h.date === new Date().toLocaleDateString());
    if (exists) return prev;

    return [
      {
        date: new Date().toLocaleDateString(),
        punchIn: now,
        breakTime: 0,
        workTime: 0,
      },
      ...prev,
    ];
  });

  // 🔹 3️⃣ working start
  setIsWorking(true);
};


  const punchOut = async () => {
    await api.post("/attendance/punch-out");

    setIsWorking(false);
    setOnBreak(false);

    const updated = {
      ...todayLog!,
      punchOut: new Date().toLocaleTimeString(),
      breakTime: breakSeconds,
      workTime: workingSeconds,
    };

    setTodayLog(updated);
   setHistory((prev) =>
     prev.map((h) =>
       h.date === todayLog?.date
         ? {
             ...h,
             punchOut: updated.punchOut,
             workTime: updated.workTime,
           }
         : h
     )
   );
  };

  const startBreak = async () => {
    await api.post("/attendance/break/start");
    setOnBreak(true);
  };

  const endBreak = async () => {
    await api.post("/attendance/break/end");
    setOnBreak(false);
    setHistory((prev) =>
      prev.map((h) =>
        h.date === todayLog?.date ? { ...h, breakTime: breakSeconds } : h
      )
    );
  };

  if(loading)return<Loader/>;
  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Attendance</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT PANEL ================= */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h2 className="font-medium mb-2">Timesheet</h2>

            <div className="w-40 h-40 mx-auto rounded-full border-4 border-gray-200 flex items-center justify-center text-xl font-semibold">
              {formatTime(workingSeconds)}
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {!todayLog && (
                <button
                  onClick={punchIn}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
                >
                  <LogIn size={16} /> Punch In
                </button>
              )}

              {todayLog && !todayLog.punchOut && (
                <>
                  <button
                    onClick={punchOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
                  >
                    <LogOut size={16} /> Punch Out
                  </button>

                  {!onBreak ? (
                    <button
                      onClick={startBreak}
                      className="px-4 py-2 bg-yellow-400 text-black rounded-lg flex items-center gap-2"
                    >
                      <Coffee size={16} /> Break
                    </button>
                  ) : (
                    <button
                      onClick={endBreak}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
                    >
                      <Play size={16} /> End Break
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Break Time: {formatTime(breakSeconds)}
            </div>
          </div>

          {/* ================= TODAY ACTIVITY ================= */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-medium mb-3">Today Activity</h3>

            {!todayLog && (
              <p className="text-sm text-gray-500">Not punched in yet</p>
            )}

            {todayLog && (
              <ul className="text-sm space-y-2">
                <li>✅ Punch In: {todayLog.punchIn}</li>
                {onBreak && <li>☕ On Break</li>}
                {todayLog.punchOut && (
                  <li>🚪 Punch Out: {todayLog.punchOut}</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2">Punch In</th>
                <th className="p-2">Punch Out</th>
                <th className="p-2">Break</th>
                <th className="p-2">Work</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{h.date}</td>
                  <td className="p-2">{h.punchIn}</td>
                  <td className="p-2">{h.punchOut}</td>
                  <td className="p-2">{formatTime(h.breakTime)}</td>
                  <td className="p-2">{formatTime(h.workTime)}</td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
