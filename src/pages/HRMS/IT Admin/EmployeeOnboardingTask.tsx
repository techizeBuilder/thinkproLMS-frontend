/** @format */

import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ================= TYPES =================
type StatusType = "PENDING" | "COMPLETED";

interface IUser {
  _id: string;
  name: string;
  email: string;
}

interface IDepartment {
  _id: string;
  name: string;
}

interface IOnboardingTask {
  _id: string;
  employee: IUser;
  department: IDepartment;
  assignedTo: IUser;
  task: string;
  status: StatusType;
  createdAt: string;
}

// ================= COMPONENT =================
export default function EmployeeOnboardingTask() {
  const [tasks, setTasks] = useState<IOnboardingTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ================= FETCH TASKS =================
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/onboarding-tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTasks(res.data);
    } catch (error) {
      console.error("Failed to load onboarding tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ================= STATUS CHANGE =================
  const handleStatusChange = async (taskId: string, status: StatusType) => {
    try {
      await axios.patch(
        `${API}/onboarding-tasks/${taskId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? { ...task, status } : task))
      );
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  // ================= STATUS COLOR =================
  const statusStyle = (status: StatusType) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "";
    }
  };

  // ================= UI =================
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Employee IT Onboarding Tasks
      </h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Task</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4">
                    No onboarding tasks found
                  </td>
                </tr>
              )}

              {tasks.map((task) => (
                <tr key={task._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{task.employee.name}</div>
                    <div className="text-sm text-gray-500">
                      {task.employee.email}
                    </div>
                  </td>

                  <td className="p-3">{task.department.name}</td>

                  <td className="p-3">{task.task}</td>

                  <td className="p-3">{task.assignedTo.name}</td>

                  <td className="p-3">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(
                          task._id,
                          e.target.value as StatusType
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium outline-none cursor-pointer ${statusStyle(
                        task.status
                      )}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>

                  <td className="p-3 text-sm text-gray-600">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
