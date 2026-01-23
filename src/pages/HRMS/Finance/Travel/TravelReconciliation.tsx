/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndianRupee, Plane, User } from "lucide-react";
import Loader from "../../Loader";

const API = import.meta.env.VITE_API_URL;

/* ================= TYPES ================= */

interface Employee {
  _id: string;
  name: string;
}

interface TravelRequest {
  _id: string;
  employee: Employee;
  purpose: string;
  destination: string;
  fromDate: string;
  toDate: string;
  budget: number;
  paymentStatus: "UNPAID" | "PAID";
  status: "APPROVED" | "PAID";
}

/* ================= COMPONENT ================= */

export default function TravelReconciliation() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */

  const fetchTravelRequests = async () => {
    try {
      const res = await axios.get(`${API}/travel-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approvedOnly = (res.data || []).filter(
        (t: TravelRequest) => t.status === "APPROVED",
      );

      setData(approvedOnly);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelRequests();
  }, []);

  /* ================= UPDATE PAYMENT STATUS ================= */

  const updatePaymentStatus = async (
    travelId: string,
    status: "PAID" | "UNPAID",
  ) => {
    try {
      await axios.put(
        `${API}/travel-requests/${travelId}`,
        { paymentStatus: status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchTravelRequests();
    } catch (error) {
      console.error("Failed to update payment status");
    }
  };

  /* ================= FILTER ================= */

  const filtered = data.filter(
    (t) =>
      t.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <Loader />;

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Plane size={22} /> Travel Reconciliation
          </h1>

          <Input
            placeholder="Search employee or destination..."
            className="md:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Employee</TableHead>
                  <TableHead className="text-left">Purpose</TableHead>
                  <TableHead className="text-left">Destination</TableHead>
                  <TableHead className="text-center">Dates</TableHead>
                  <TableHead className="text-center">Approved Budget</TableHead>
                  <TableHead className="text-center">Payment Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-gray-500"
                    >
                      No approved travel requests found
                    </TableCell>
                  </TableRow>
                )}

                {filtered.map((t) => (
                  <TableRow key={t._id} className="hover:bg-gray-50">
                    {/* Employee */}
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        <span className="font-medium">
                          {t.employee?.name || "—"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Purpose */}
                    <TableCell className="text-left">{t.purpose}</TableCell>

                    {/* Destination */}
                    <TableCell className="text-left">{t.destination}</TableCell>

                    {/* Dates */}
                    <TableCell className="text-center text-xs">
                      <div>{new Date(t.fromDate).toLocaleDateString()}</div>
                      <div className="text-gray-400">to</div>
                      <div>{new Date(t.toDate).toLocaleDateString()}</div>
                    </TableCell>

                    {/* Budget */}
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-1 font-semibold">
                        <IndianRupee size={14} />
                        {t.budget}
                      </div>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell className="text-center">
                      {t.paymentStatus === "PAID" ? (
                        <Badge variant="success">PAID</Badge>
                      ) : (
                        <Select
                          value={t.paymentStatus}
                          onValueChange={(value) =>
                            updatePaymentStatus(t._id, value as "PAID")
                          }
                        >
                          <SelectTrigger className="w-28 mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNPAID">UNPAID</SelectItem>
                            <SelectItem value="PAID">PAID</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
