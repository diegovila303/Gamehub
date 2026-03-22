import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Gamepad2, Clock, WifiOff, Zap } from "lucide-react";

const statusColors = {
  playing: "bg-green-400",
  scheduled: "bg-amber-400",
  offline: "bg-muted-foreground/40",
};

const statusIcons = {
  playing: Gamepad2,
  scheduled: Clock,
  offline: WifiOff,
};

const statusLabels = {
  playing: "está jugando a",
  scheduled: "va a jugar a",
  offline: "se puso offline",
};

export default function FeedPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenar: jugando primero, luego scheduled, luego offline
      data.sort((a, b) => {
        const order = { playing: 0, scheduled: 1, offline: 2 };
        return (order[a.status] ?? 2) - (order[b.status] ?? 2);
      });
      setUsers(data);
    });
    return unsub;
  }, []);

  const online = users.filter(u => u.status !== "offline");
  const offline = users.filter(u => u.status === "offline");

  const UserCard = ({ u }) => {
    const Icon = statusIcons[u.status] || WifiOff;
    const isMe = u.uid === user?.uid;

    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-card border transition-all ${
        u.status === "playing" ? "border-green-500/30 shadow-sm shadow-green-500/10" :
        u.status === "scheduled" ? "border-amber-500/30 shadow-sm shadow-amber-500/10" :
        "border-border"
      }`}>
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
            {u.avatar
              ? <img src={u.avatar} className="w-full h-full object-cover" />
              : (u.name || "?")[0].toUpperCase()
            }
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusColors[u.status] || statusColors.offline}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">
              {isMe ? "Tú" : u.name || u.email}
            </p>
            {isMe && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">yo</span>}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {u.status === "offline"
              ? u.lastSeen
                ? `Offline • hace ${formatDistanceToNow(new Date(u.lastSeen), { locale: es })}`
                : "Offline"
              : `${statusLabels[u.status]} ${u.current_game || "algo"}`
            }
          </p>
        </div>

        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          u.status === "playing" ? "bg-green-500/15" :
          u.status === "scheduled" ? "bg-amber-500/15" :
          "bg-secondary"
        }`}>
          <Icon className={`w-4 h-4 ${
            u.status === "playing" ? "text-green-400" :
            u.status === "scheduled" ? "text-amber-400" :
            "text-muted-foreground"
          }`} />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Actividad</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground">En vivo</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">¿Qué hay?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {online.length > 0 ? `${online.length} ${online.length === 1 ? "persona" : "personas"} activas ahora` : "Nadie activo ahora"}
      </p>

      {online.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activos ahora</p>
          <div className="flex flex-col gap-2">
            {online.map(u => <UserCard key={u.id} u={u} />)}
          </div>
        </div>
      )}

      {offline.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Offline</p>
          <div className="flex flex-col gap-2">
            {offline.map(u => <UserCard key={u.id} u={u} />)}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Zap className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/80 mb-1">Sin actividad aun</p>
            <p className="text-sm text-muted-foreground">Cuando tus amigos se conecten los veras aqui</p>
          </div>
        </div>
      )}
    </div>
  );
}
