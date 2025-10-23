import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Search, RefreshCw } from "lucide-react";
import {
  getActivityLogs,
  getActivityStatistics,
  exportActivityLogs,
  type ActivityLog,
  type ActivityLogFilters,
  type ActivityStatistics,
} from "@/api/activityLogApi";
import { toast } from "sonner";

const ActivityLogsPage: React.FC = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const [filterOptions, setFilterOptions] = useState({
    actions: [] as string[],
    resourceTypes: [] as string[],
    severities: [] as string[],
    users: [] as Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
    }>,
    schools: [] as Array<{ _id: string; name: string }>,
  });
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Load activity logs
  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await getActivityLogs(filters);
      setActivityLogs(response.data.activityLogs);
      setPagination(response.data.pagination);
      setFilterOptions(response.data.filters);
    } catch (error) {
      console.error("Error loading activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await getActivityStatistics({
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
      });
      setStatistics(response);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ActivityLogFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle date range change
  const handleDateRangeChange = (
    from: Date | undefined,
    to: Date | undefined
  ) => {
    setDateRange({ from, to });
    setFilters((prev) => ({
      ...prev,
      startDate: from?.toISOString(),
      endDate: to?.toISOString(),
      page: 1,
    }));
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportActivityLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Activity logs exported successfully");
    } catch (error) {
      console.error("Error exporting activity logs:", error);
      toast.error("Failed to export activity logs");
    } finally {
      setExporting(false);
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status badge color
  const getStatusColor = (isSuccess: boolean) => {
    return isSuccess ? "bg-green-500" : "bg-red-500";
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadActivityLogs();
  }, [filters]);

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-gray-600">
            Monitor and track all user activities across the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadActivityLogs}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Search */}
          <div className="space-y-1">
            <Label htmlFor="search" className="text-sm">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search activities..."
                className="pl-8 h-9"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Action</Label>
            <Select
              value={filters.action || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "action",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="CREATED_SCHOOL">Created School</SelectItem>
                <SelectItem value="UPDATED_SCHOOL">Updated School</SelectItem>
                <SelectItem value="DELETED_SCHOOL">Deleted School</SelectItem>
                <SelectItem value="CREATED_STUDENT">Created Student</SelectItem>
                <SelectItem value="UPDATED_STUDENT">Updated Student</SelectItem>
                <SelectItem value="DELETED_STUDENT">Deleted Student</SelectItem>
                <SelectItem value="BULK_UPLOADED_STUDENTS">
                  Bulk Uploaded Students
                </SelectItem>
                <SelectItem value="CREATED_MENTOR">Created Mentor</SelectItem>
                <SelectItem value="UPDATED_MENTOR">Updated Mentor</SelectItem>
                <SelectItem value="DELETED_MENTOR">Deleted Mentor</SelectItem>
                <SelectItem value="CREATED_SCHOOL_ADMIN">
                  Created School Admin
                </SelectItem>
                <SelectItem value="UPDATED_SCHOOL_ADMIN">
                  Updated School Admin
                </SelectItem>
                <SelectItem value="DELETED_SCHOOL_ADMIN">
                  Deleted School Admin
                </SelectItem>
                <SelectItem value="CREATED_LEAD_MENTOR">
                  Created Lead Mentor
                </SelectItem>
                <SelectItem value="UPDATED_LEAD_MENTOR">
                  Updated Lead Mentor
                </SelectItem>
                <SelectItem value="DELETED_LEAD_MENTOR">
                  Deleted Lead Mentor
                </SelectItem>
                <SelectItem value="CREATED_SUPER_ADMIN">
                  Created Super Admin
                </SelectItem>
                <SelectItem value="UPDATED_SUPER_ADMIN">
                  Updated Super Admin
                </SelectItem>
                <SelectItem value="DELETED_SUPER_ADMIN">
                  Deleted Super Admin
                </SelectItem>
                <SelectItem value="CREATED_MODULE">Created Module</SelectItem>
                <SelectItem value="UPDATED_MODULE">Updated Module</SelectItem>
                <SelectItem value="DELETED_MODULE">Deleted Module</SelectItem>
                <SelectItem value="CREATED_SESSION">Created Session</SelectItem>
                <SelectItem value="UPDATED_SESSION">Updated Session</SelectItem>
                <SelectItem value="DELETED_SESSION">Deleted Session</SelectItem>
                <SelectItem value="UPLOADED_RESOURCE">
                  Uploaded Resource
                </SelectItem>
                <SelectItem value="UPDATED_RESOURCE">
                  Updated Resource
                </SelectItem>
                <SelectItem value="DELETED_RESOURCE">
                  Deleted Resource
                </SelectItem>
                <SelectItem value="CREATED_ASSESSMENT">
                  Created Assessment
                </SelectItem>
                <SelectItem value="UPDATED_ASSESSMENT">
                  Updated Assessment
                </SelectItem>
                <SelectItem value="DELETED_ASSESSMENT">
                  Deleted Assessment
                </SelectItem>
                <SelectItem value="CREATED_QUESTION">
                  Created Question
                </SelectItem>
                <SelectItem value="UPDATED_QUESTION">
                  Updated Question
                </SelectItem>
                <SelectItem value="DELETED_QUESTION">
                  Deleted Question
                </SelectItem>
                <SelectItem value="GENERATED_CERTIFICATE">
                  Generated Certificate
                </SelectItem>
                <SelectItem value="DELETED_CERTIFICATE">
                  Deleted Certificate
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resource Type Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Resource Type</Label>
            <Select
              value={filters.resourceType || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "resourceType",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="MENTOR">Mentor</SelectItem>
                <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                <SelectItem value="LEAD_MENTOR">Lead Mentor</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="MODULE">Module</SelectItem>
                <SelectItem value="SESSION">Session</SelectItem>
                <SelectItem value="RESOURCE">Resource</SelectItem>
                <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                <SelectItem value="QUESTION">Question</SelectItem>
                <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                <SelectItem value="FILE">File</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Severity</Label>
            <Select
              value={filters.severity || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "severity",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="space-y-1">
            <Label className="text-sm">User</Label>
            <Select
              value={filters.userId || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "userId",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {filterOptions.users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School Filter */}
          <div className="space-y-1">
            <Label className="text-sm">School</Label>
            <Select
              value={filters.schoolId || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "schoolId",
                  value === "all" ? undefined : value
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All schools</SelectItem>
                {filterOptions.schools.map((school) => (
                  <SelectItem key={school._id} value={school._id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <Label className="text-sm">Status</Label>
            <Select
              value={filters.isSuccess?.toString() || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "isSuccess",
                  value === "all" ? undefined : value === "true"
                )
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <Label className="text-sm">Date Range</Label>
            <div className="flex gap-1">
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={
                    dateRange.from
                      ? dateRange.from.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleDateRangeChange(date, dateRange.to);
                  }}
                  className="h-9 text-xs"
                />
              </div>
              <div className="relative flex-1">
                <Input
                  type="date"
                  value={
                    dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value
                      ? new Date(e.target.value)
                      : undefined;
                    handleDateRangeChange(dateRange.from, date);
                  }}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Activity Logs</CardTitle>
            {statistics && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Total Activities</div>
                  <div className="font-bold text-lg">
                    {statistics.data.overview.totalActivities}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Success Rate</div>
                  <div className="font-bold text-lg">
                    {statistics.data.overview.successRate}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Successful</div>
                  <div className="font-bold text-lg text-green-600">
                    {statistics.data.overview.successfulActivities}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Failed</div>
                  <div className="font-bold text-lg text-red-600">
                    {statistics.data.overview.failedActivities}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2 font-medium">Timestamp</th>
                      <th className="text-left p-2 font-medium">User</th>
                      <th className="text-left p-2 font-medium">Action</th>
                      <th className="text-left p-2 font-medium">Resource</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Severity</th>
                      <th className="text-left p-2 font-medium">IP</th>
                      <th className="text-left p-2 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="text-xs text-gray-600">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-sm">
                            {log.userName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.userEmail}
                          </div>
                          <div className="text-xs text-gray-400">
                            {log.userRole}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-sm">
                            {log.action.replace(/_/g, " ")}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate">
                            {log.description}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-sm">
                            {log.resourceType}
                          </div>
                          {log.resourceName && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {log.resourceName}
                            </div>
                          )}
                          {log.schoolName && (
                            <div className="text-xs text-gray-400 max-w-xs truncate">
                              {log.schoolName}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge
                            className={`${getStatusColor(
                              log.isSuccess
                            )} text-xs`}
                          >
                            {log.isSuccess ? "Success" : "Failed"}
                          </Badge>
                          {log.errorMessage && (
                            <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                              {log.errorMessage}
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <Badge
                            className={`${getSeverityColor(
                              log.severity
                            )} text-xs`}
                          >
                            {log.severity}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="p-2 text-xs text-gray-500">
                          {log.duration ? `${log.duration}ms` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                  Showing{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} entries
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="px-2 py-1 text-xs text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="h-8 px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogsPage;
