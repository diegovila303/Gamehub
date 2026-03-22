import { cn } from "@/lib/utils";
import { getGame } from "@/lib/games";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusColors = {
  playing: "bg-green-400",
  scheduled: "bg-amber-400",
  offline: "bg-muted-foreground/40",
};

const statusLabels = {
  playing: "Jugando",
  scheduled: "Va a jugar",
  offline: "Offline",
};

export default function FriendCard({ friend }) {
  const game = friend.current_game ? getGame(friend.current_game) : null;
  const initial = (friend.user_name || friend.user_email || "?")[0].toUpperCase();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-muted-foreground/20 transition-all">
      <div className="relative">
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
          {friend.avatar_url ? (
            <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
          statusColors[friend.status] || statusColors.offline
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {friend.user_name || friend.user_email}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
          <span>{statusLabels[friend.status] || "Offline"}</span>
          {game && (
            <>
              <span>•</span>
              <span>{game.icon} {game.name}</span>
            </>
          )}
          {friend.status === "scheduled" && friend.scheduled_time && (
            <>
              <span>•</span>
              <span>{format(new Date(friend.scheduled_time), "HH:mm", { locale: es })}</span>
            </>
          )}
        </p>
      </div>
      <Link
        to={`/chat?to=${friend.user_email}`}
        className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
      >
        <MessageCircle className="w-4 h-4" />
      </Link>
    </div>
  );
}
