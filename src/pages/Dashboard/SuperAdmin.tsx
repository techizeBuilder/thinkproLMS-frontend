import { Outlet } from "react-router-dom";

export default function SuperAdmin() {
  return (
    <div className="min-h-screen bg-background">
      SuperAdmin
      <Outlet />
    </div>
  );
}
