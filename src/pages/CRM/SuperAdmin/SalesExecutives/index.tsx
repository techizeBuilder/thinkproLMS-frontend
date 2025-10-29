import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

type SalesExecutive = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  tpaEmpId: string;
  isActive: boolean;
  createdAt: string;
  manager?: { name: string } | null;
};

export default function SalesExecutivesPage() {
  const [loading, setLoading] = useState(true);
  const [executives, setExecutives] = useState<SalesExecutive[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/sales/executives");
        setExecutives(res.data.data || []);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Executives</h1>
          <p className="text-gray-600 mt-1">Manage your sales executive team</p>
        </div>
        <Link to="/crm/superadmin/sales-executives/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sales Executive
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Executives List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>TPA Emp Id</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>Loading...</TableCell>
                  </TableRow>
                ) : executives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      No sales executives found.
                    </TableCell>
                  </TableRow>
                ) : (
                  executives.map((executive) => (
                    <TableRow key={executive._id}>
                      <TableCell className="font-medium">
                        {executive.name}
                      </TableCell>
                      <TableCell>{executive.email}</TableCell>
                      <TableCell>{executive.phoneNumber}</TableCell>
                      <TableCell>{executive.tpaEmpId}</TableCell>
                      <TableCell>
                        {executive.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(executive.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{executive.manager?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
