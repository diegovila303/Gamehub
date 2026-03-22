import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Zap, Users, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Gamepad2, label: "Estado" },
  { path: "/feed", icon: Zap, label: "Feed" },
  { path: "/friends", icon: Users, label: "Amigos" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/profile", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("relative", active && "drop-shadow-[0_0_8px_hsl(265,70%,60%)]")}>
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
