import { Outlet } from "react-router-dom";
import BottomNav from "../nav/BottomNav";

export default function AppLayout() {
  return (
    <div className="h-full bg-background font-inter flex flex-col">
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
