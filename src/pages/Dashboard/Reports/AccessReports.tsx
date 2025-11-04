import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportService, type ResourceAccessReport } from '@/api/reportService';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AccessReportsPage() {
  const [filters] = useState<{ grade?: string; startDate?: string; endDate?: string }>({});
  const [items, setItems] = useState<ResourceAccessReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  const load = async () => {
    setIsLoading(true);
    try {
      const list = await reportService.getAccess({ ...filters, limit: 100 });
      setItems(list.items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleResource = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0 mins';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins} mins`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Access Reports</h1>

      {/* <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={filters.grade || 'all'} onValueChange={(value) => setFilters({ ...filters, grade: value === 'all' ? undefined : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} placeholder="Start Date" />
          <Input type="date" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} placeholder="End Date" />
          <div className="flex gap-2">
            <Button onClick={load} disabled={isLoading}>Apply</Button>
            <Button variant="outline" onClick={() => { setFilters({}); setTimeout(load, 0); }}>Reset</Button>
          </div>
        </CardContent>
      </Card> */}

      {/* {summary && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Accesses</div>
              <div className="text-xl font-semibold">{summary.totals?.accessCount || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
              <div className="text-xl font-semibold">{formatDuration(summary.totals?.timeSpent || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Video Watch Duration</div>
              <div className="text-xl font-semibold">{formatDuration(summary.totals?.videoTime || 0)}</div>
            </div>
          </CardContent>
        </Card>
      )} */}

      <Card>
        <CardHeader>
          <CardTitle>Resource Access Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((resource) => {
              const isExpanded = expandedResources.has(resource.resourceId);
              return (
                <div key={resource.resourceId} className="border rounded-lg">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleResource(resource.resourceId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{resource.resourceTitle}</h3>
                        <Badge variant={resource.resourceType === 'video' ? 'default' : 'secondary'}>
                          {resource.resourceType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {resource.totalStudents} student{resource.totalStudents !== 1 ? 's' : ''} • {resource.totalAccesses} access{resource.totalAccesses !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="p-2 font-medium">Student</th>
                              <th className="p-2 font-medium">Grade</th>
                              <th className="p-2 font-medium">Accesses</th>
                              <th className="p-2 font-medium">Time Spent</th>
                              {resource.resourceType === 'video' && (
                                <th className="p-2 font-medium">Watch Duration</th>
                              )}
                              <th className="p-2 font-medium">Last Access</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resource.students.map((student) => (
                              <tr key={`${student.userId}-${resource.resourceId}`} className="border-b">
                                <td className="p-2">{student.userName}</td>
                                <td className="p-2">{student.grade || '-'}</td>
                                <td className="p-2">{student.accessCount}</td>
                                <td className="p-2">{formatDuration(student.totalTimeSpentSeconds)}</td>
                                {resource.resourceType === 'video' && (
                                  <td className="p-2">{formatDuration(student.watchDurationSeconds)}</td>
                                )}
                                <td className="p-2">
                                  {student.lastAccessAt ? new Date(student.lastAccessAt).toLocaleString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">No access data found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


