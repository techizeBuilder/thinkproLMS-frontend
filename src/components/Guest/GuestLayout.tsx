import { Outlet } from "react-router-dom";
import GuestSidebar from "./GuestSidebar";

export default function GuestLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <GuestSidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
