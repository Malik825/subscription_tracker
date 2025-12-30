import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
