import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import FriendCard from "@/components/friends/FriendCard";

// Amigos de ejemplo para demo
const DEMO_FRIENDS = [];

export default function AmigosPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_FRIENDS.filter(f =>
    (f.user_name || f.user_email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Amigos</h1>
          <p className="text-sm text-muted-foreground">
            {DEMO_FRIENDS.filter(f => f.status !== "offline").length} en línea
          </p>
        </div>
        <button className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 mb-6">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Buscar amigos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Lista o empty state */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((friend, i) => (
            <FriendCard key={i} friend={friend} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/80 mb-1">Aún no hay amigos conectados</p>
            <p className="text-sm text-muted-foreground">Invita a tus amigos para verlos aquí</p>
          </div>
        </div>
      )}
    </div>
  );
}
