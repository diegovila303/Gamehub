import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
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

export default function AmigosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const me = users.find(u => u.uid === user?.uid);
  const others = users.filter(u => u.uid !== user?.uid);
  const filtered = others.filter(u =>
    (u.name || u.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const online = others.filter(u => u.status !== "offline");

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Amigos</h1>
          <p className="text-sm text-muted-foreground">{online.length} en linea</p>
        </div>
      </div>

      {/* Mi estado */}
      {me && (
        <div className="mb-5 p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Mi estado</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                {me.avatar ? <img src={me.avatar} className="w-full h-full rounded-full object-cover" /> : (me.name || "?")[0].toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[me.status] || statusColors.offline}`} />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{me.name}</p>
              <p className="text-xs text-muted-foreground">
                {statusLabels[me.status] || "Offline"}
                {me.current_game ? ` • ${me.current_game}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 mb-4">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Lista */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {[...filtered].sort((a, b) => {
            const order = { playing: 0, scheduled: 1, offline: 2 };
            return (order[a.status] ?? 2) - (order[b.status] ?? 2);
          }).map((friend) => (
            <div key={friend.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
                  {friend.avatar ? <img src={friend.avatar} className="w-full h-full rounded-full object-cover" /> : (friend.name || "?")[0].toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusColors[friend.status] || statusColors.offline}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{friend.name || friend.email}</p>
                <p className="text-xs text-muted-foreground">
                  {statusLabels[friend.status] || "Offline"}
                  {friend.current_game ? ` • ${friend.current_game}` : ""}
                  {friend.status === "offline" && friend.lastSeen
                    ? ` • hace ${formatDistanceToNow(new Date(friend.lastSeen), { locale: es })}`
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/80 mb-1">Aun no hay nadie aqui</p>
            <p className="text-sm text-muted-foreground">Cuando tus amigos se registren apareceran aqui</p>
          </div>
        </div>
      )}
    </div>
  );
}
