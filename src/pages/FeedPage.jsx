import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Gamepad2, Clock, WifiOff, Zap } from "lucide-react";

const statusColors = { playing: "bg-green-400", scheduled: "bg-amber-400", offline: "bg-muted-foreground/40" };
const statusIcons = { playing: Gamepad2, scheduled: Clock, offline: WifiOff };
const statusLabels = { playing: "esta jugando a", scheduled: "va a jugar a", offline: "offline" };

export default function FeedPage() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [friendUids, setFriendUids] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), snap => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q1 = query(collection(db, "friendRequests"), where("from", "==", user.uid), where("status", "==", "accepted"));
    const q2 = query(collection(db, "friendRequests"), where("to", "==", user.uid), where("status", "==", "accepted"));
    const u1 = onSnapshot(q1, snap => setFriendUids(prev => [...new Set([...prev, ...snap.docs.map(d => d.data().to)])]));
    const u2 = onSnapshot(q2, snap => setFriendUids(prev => [...new Set([...prev, ...snap.docs.map(d => d.data().from)])]));
    return () => { u1(); u2(); };
  }, [user]);

  const me = allUsers.find(u => u.uid === user?.uid);
  const friends = allUsers.filter(u => friendUids.includes(u.uid));
  const visible = me ? [me, ...friends] : friends;
  const sorted = [...visible].sort((a, b) => ({ playing: 0, scheduled: 1, offline: 2 }[a.status] ?? 2) - ({ playing: 0, scheduled: 1, offline: 2 }[b.status] ?? 2));
  const online = visible.filter(u => u.status !== "offline");

  const UserCard = ({ u }) => {
    const Icon = statusIcons[u.status] || WifiOff;
    const isMe = u.uid === user?.uid;
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-card border transition-all ${u.status === "playing" ? "border-green-500/30" : u.status === "scheduled" ? "border-amber-500/30" : "border-border"}`}>
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name || "?")[0].toUpperCase()}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${statusColors[u.status] || statusColors.offline}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{isMe ? "Tu" : u.name || u.email}</p>
            {isMe && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">yo</span>}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {u.status === "offline"
              ? u.lastSeen ? `Offline - hace ${formatDistanceToNow(new Date(u.lastSeen), { locale: es })}` : "Offline"
              : `${statusLabels[u.status]} ${u.current_game || "algo"}`}
          </p>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${u.status === "playing" ? "bg-green-500/15" : u.status === "scheduled" ? "bg-amber-500/15" : "bg-secondary"}`}>
          <Icon className={`w-4 h-4 ${u.status === "playing" ? "text-green-400" : u.status === "scheduled" ? "text-amber-400" : "text-muted-foreground"}`} />
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
      <h1 className="text-2xl font-bold text-foreground mb-1">Que hay?</h1>
      <p className="text-sm text-muted-foreground mb-6">{online.length > 0 ? `${online.length} activos ahora` : "Nadie activo ahora"}</p>
      {friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Zap className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center">Aun no tienes amigos.</p>
        </div>
      ) : (
        <>
          {sorted.filter(u => u.status !== "offline").length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Activos ahora</p>
              <div className="flex flex-col gap-2">{sorted.filter(u => u.status !== "offline").map(u => <UserCard key={u.id} u={u} />)}</div>
            </div>
          )}
          {sorted.filter(u => u.status === "offline").length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Offline</p>
              <div className="flex flex-col gap-2">{sorted.filter(u => u.status === "offline").map(u => <UserCard key={u.id} u={u} />)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
