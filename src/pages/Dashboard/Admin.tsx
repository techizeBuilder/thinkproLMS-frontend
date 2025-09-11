import { AdminSidebar } from "@/components/ui/admin-sidebar"

export default function Admin() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-64 border-r">
        <AdminSidebar className="w-full" />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="h-16 border-b px-6 flex items-center">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        </div>
        <div className="p-6">
          {/* Main content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-2">My Courses</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-2">Active Students</h2>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="rounded-lg border p-4">
              <h2 className="text-xl font-semibold mb-2">Course Revenue</h2>
              <p className="text-3xl font-bold">$0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
