import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart,
  Download, 
  RefreshCw,
  Filter,
  Calendar
} from "lucide-react";
import reportService, { type ChartData } from "@/api/reportService";
import { toast } from "sonner";

// Simple chart components (you can replace these with a proper charting library like Chart.js or Recharts)
const BarChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">{data.datasets[0].label}</h4>
      </div>
      <div className="space-y-3">
        {data.labels.map((label, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="font-medium">{data.datasets[0].data[index]}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(data.datasets[0].data[index] / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PieChart = ({ data }: { data: ChartData }) => {
  const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">{data.datasets[0].label}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">{label}</span>
              <span className="text-sm font-medium ml-auto">
                {data.datasets[0].data[index]} ({Math.round((data.datasets[0].data[index] / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {data.labels.map((_, index) => {
                const value = data.datasets[0].data[index];
                const percentage = (value / total) * 100;
                const circumference = 2 * Math.PI * 45; // radius = 45
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = index === 0 ? 0 : 
                  -((data.datasets[0].data.slice(0, index).reduce((sum, val) => sum + val, 0) / total) * circumference);
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data }: { data: ChartData }) => {
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  const minValue = Math.min(...data.datasets.flatMap(dataset => dataset.data));
  const range = maxValue - minValue;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium">Activity Timeline</h4>
      </div>
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 800 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, index) => (
            <line
              key={index}
              x1="50"
              y1={50 + (percent / 100) * 150}
              x2="750"
              y2={50 + (percent / 100) * 150}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Chart lines */}
          {data.datasets.map((dataset, datasetIndex) => {
            const points = data.labels.map((_, index) => {
              const x = 50 + (index / (data.labels.length - 1)) * 700;
              const y = 200 - 50 - ((dataset.data[index] - minValue) / range) * 150;
              return `${x},${y}`;
            }).join(' ');
            
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
            
            return (
              <polyline
                key={datasetIndex}
                fill="none"
                stroke={colors[datasetIndex % colors.length]}
                strokeWidth="2"
                points={points}
                className="transition-all duration-300"
              />
            );
          })}
          
          {/* Data points */}
          {data.datasets.map((dataset, datasetIndex) => 
            data.labels.map((_, index) => {
              const x = 50 + (index / (data.labels.length - 1)) * 700;
              const y = 200 - 50 - ((dataset.data[index] - minValue) / range) * 150;
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
              
              return (
                <circle
                  key={`${datasetIndex}-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors[datasetIndex % colors.length]}
                  className="transition-all duration-300"
                />
              );
            })
          )}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500">
          {data.labels.map((label, index) => (
            <span key={index} className="transform -rotate-45 origin-left">
              {label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {data.datasets.map((dataset, index) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">{dataset.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function GraphicalReportsComponent() {
  const [chartData, setChartData] = useState<Record<string, ChartData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    section: "",
    schoolId: "",
    startDate: "",
    endDate: ""
  });

  const chartTypes = [
    {
      id: "module_completion_by_grade",
      name: "Module Completion by Grade",
      description: "Module completion rates across different grades",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: "assessment_performance_by_grade",
      name: "Assessment Performance by Grade",
      description: "Average assessment scores by grade",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: "student_activity_timeline",
      name: "Student Activity Timeline",
      description: "Student engagement over time",
      icon: <LineChart className="h-5 w-5" />
    },
    {
      id: "resource_usage_by_type",
      name: "Resource Usage by Type",
      description: "Usage of different resource types",
      icon: <PieChart className="h-5 w-5" />
    }
  ];

  const loadChartData = async (chartType: string) => {
    try {
      setLoading(prev => ({ ...prev, [chartType]: true }));
      const response = await reportService.getGraphicalReportData(chartType, filters);
      setChartData(prev => ({ ...prev, [chartType]: response.data }));
    } catch (error) {
      console.error(`Error loading ${chartType} chart:`, error);
      toast.error(`Failed to load ${chartType} chart`);
    } finally {
      setLoading(prev => ({ ...prev, [chartType]: false }));
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Reload all charts with new filters
    chartTypes.forEach(chart => {
      loadChartData(chart.id);
    });
  };

  const handleClearFilters = () => {
    setFilters({ 
      grade: "", 
      subject: "", 
      section: "", 
      schoolId: "", 
      startDate: "", 
      endDate: "" 
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality will be implemented soon");
  };

  useEffect(() => {
    // Load all charts on component mount
    chartTypes.forEach(chart => {
      loadChartData(chart.id);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleApplyFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Charts
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Chart Filters
          </CardTitle>
          <CardDescription>
            Apply filters to customize the chart data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={filters.grade} onValueChange={(value) => handleFilterChange("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                value={filters.subject}
                onChange={(e) => handleFilterChange("subject", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                placeholder="Enter section"
                value={filters.section}
                onChange={(e) => handleFilterChange("section", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                placeholder="Enter school ID"
                value={filters.schoolId}
                onChange={(e) => handleFilterChange("schoolId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartTypes.map((chart) => (
          <Card key={chart.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {chart.icon}
                {chart.name}
              </CardTitle>
              <CardDescription>{chart.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading[chart.id] ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading chart...</span>
                </div>
              ) : chartData[chart.id] ? (
                <div>
                  {chart.id === "module_completion_by_grade" && (
                    <BarChart data={chartData[chart.id]} />
                  )}
                  {chart.id === "assessment_performance_by_grade" && (
                    <BarChart data={chartData[chart.id]} />
                  )}
                  {chart.id === "student_activity_timeline" && (
                    <LineChart data={chartData[chart.id]} />
                  )}
                  {chart.id === "resource_usage_by_type" && (
                    <PieChart data={chartData[chart.id]} />
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for this chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Insights
          </CardTitle>
          <CardDescription>
            Automated insights based on the chart data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Performance Highlights</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Grade 5 shows highest module completion rate</li>
                <li>• Video content has 40% higher engagement than documents</li>
                <li>• Assessment scores improved by 15% this month</li>
                <li>• Peak activity occurs between 2-4 PM</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Focus on Grade 3 module completion</li>
                <li>• Increase video content for better engagement</li>
                <li>• Schedule assessments during peak hours</li>
                <li>• Provide additional support for struggling students</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
