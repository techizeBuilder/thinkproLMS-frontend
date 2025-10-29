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

type SalesManager = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  tpaEmpId: string;
  isActive: boolean;
  createdAt: string;
};

export default function SalesManagersPage() {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<SalesManager[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/sales/managers");
        setManagers(res.data.data || []);
      } catch (e) {
        // noop for now
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Managers</h1>
          <p className="text-gray-600 mt-1">
            Manage your sales management team
          </p>
        </div>
        <Link to="/crm/superadmin/sales-managers/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Sales Manager
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Managers List</CardTitle>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : managers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>No sales managers found.</TableCell>
                  </TableRow>
                ) : (
                  managers.map((manager) => (
                    <TableRow key={manager._id}>
                      <TableCell className="font-medium">
                        {manager.name}
                      </TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>{manager.phoneNumber}</TableCell>
                      <TableCell>{manager.tpaEmpId}</TableCell>
                      <TableCell>
                        {manager.isActive ? (
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </TableCell>
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
