import { Outlet } from "react-router-dom";
import BottomNav from "../nav/BottomNav";
import NotificationBell from "../NotificationBell";

export default function AppLayout() {
  return (
    <div className="h-full bg-background font-inter flex flex-col">
      <div className="flex items-center justify-end px-4 pt-3 max-w-lg mx-auto w-full">
        <NotificationBell />
      </div>
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
