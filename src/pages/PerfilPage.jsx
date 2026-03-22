import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { LogOut, Edit2, Check, X, Gamepad2, Copy, CheckCheck } from "lucide-react";

const GAMES = ["Valorant","Fortnite","League of Legends","Minecraft","CS2","Apex Legends","Rocket League","GTA V","Call of Duty","FIFA","EA FC","Overwatch 2","Elden Ring","Cyberpunk 2077"];

const BANNERS = [
  { id: 0, class: "from-violet-600 via-purple-600 to-indigo-600" },
  { id: 1, class: "from-pink-600 via-rose-500 to-red-600" },
  { id: 2, class: "from-emerald-500 via-teal-500 to-cyan-600" },
  { id: 3, class: "from-amber-500 via-orange-500 to-red-500" },
  { id: 4, class: "from-blue-600 via-blue-500 to-cyan-500" },
  { id: 5, class: "from-purple-600 via-pink-500 to-rose-500" },
  { id: 6, class: "from-slate-700 via-slate-600 to-slate-800" },
  { id: 7, class: "from-green-600 via-emerald-500 to-teal-600" },
]

const statusConfig = {
  playing: { label: "Jugando", color: "text-green-400", dot: "bg-green-400" },
  scheduled: { label: "Va a jugar", color: "text-amber-400", dot: "bg-amber-400" },
  offline: { label: "Offline", color: "text-muted-foreground", dot: "bg-muted-foreground/40" },
}

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ username: "", bio: "", favoriteGames: [], bannerId: 0, status: "offline", current_game: null });
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        const p = {
          username: d.username || "",
          bio: d.bio || "",
          favoriteGames: d.favoriteGames || [],
          bannerId: d.bannerId ?? 0,
          status: d.status || "offline",
          current_game: d.current_game || null,
        };
        setProfile(p);
        setDraft(p);
      }
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), {
      username: draft.username,
      bio: draft.bio,
      favoriteGames: draft.favoriteGames,
      bannerId: draft.bannerId,
    });
    setProfile(draft);
    setSaving(false);
    setEditing(false);
  };

  const toggleGame = (game) => setDraft(prev => ({
    ...prev,
    favoriteGames: prev.favoriteGames.includes(game)
      ? prev.favoriteGames.filter(g => g !== game)
      : prev.favoriteGames.length < 5
        ? [...prev.favoriteGames, game]
        : prev.favoriteGames
  }));

  const copyUsername = () => {
    navigator.clipboard.writeText(profile.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = editing ? draft : profile;
  const banner = BANNERS[current.bannerId] || BANNERS[0];
  const status = statusConfig[profile.status] || statusConfig.offline;

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className={`relative h-36 bg-gradient-to-r ${banner.class}`}>
        {editing && (
          <div className="absolute bottom-3 right-3 flex gap-2 bg-black/40 backdrop-blur-sm rounded-xl p-2">
            {BANNERS.map((b) => (
              <button key={b.id} onClick={() => setDraft(prev => ({ ...prev, bannerId: b.id }))}
                className={`w-7 h-7 rounded-lg bg-gradient-to-r ${b.class} transition-all ${draft.bannerId === b.id ? "ring-2 ring-white scale-110" : "opacity-70 hover:opacity-100"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Avatar + acciones */}
      <div className="px-4">
        <div className="flex items-end justify-between -mt-12 mb-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-background bg-secondary overflow-hidden shadow-xl">
              {user?.photoURL
                ? <img src={user.photoURL} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">{(user?.displayName || "?")[0].toUpperCase()}</div>}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${status.dot}`} />
          </div>

          <div className="flex gap-2 mb-1">
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Editar perfil
              </button>
            ) : (
              <>
                <button onClick={() => { setDraft(profile); setEditing(false); }}
                  className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                  <Check className="w-3.5 h-3.5" /> {saving ? "..." : "Guardar"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Nombre y username */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-foreground">{user?.displayName}</h2>
          <div className="flex items-center gap-2 mt-1">
            {editing ? (
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
                <span className="text-muted-foreground text-sm font-medium">@</span>
                <input
                  value={draft.username}
                  onChange={e => setDraft(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                  className="bg-transparent text-sm text-foreground focus:outline-none w-32"
                  placeholder="username"
                />
              </div>
            ) : (
              <button onClick={copyUsername} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                <span className="font-mono">{current.username || "sin username"}</span>
                {copied
                  ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                  : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            )}
          </div>

          {/* Estado actual */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
              {profile.current_game ? ` · ${profile.current_game}` : ""}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-5 p-4 rounded-2xl bg-card border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sobre mí</p>
          {editing ? (
            <textarea
              value={draft.bio}
              onChange={e => setDraft(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Cuéntale algo a tus amigos..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
            />
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed">
              {current.bio || <span className="text-muted-foreground italic">Sin bio todavía</span>}
            </p>
          )}
        </div>

        {/* Juegos favoritos */}
        <div className="mb-5 p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Juegos favoritos</p>
            </div>
            {editing && <span className="text-xs text-muted-foreground">{draft.favoriteGames.length}/5</span>}
          </div>

          {editing ? (
            <div className="flex flex-wrap gap-2">
              {GAMES.map(game => (
                <button key={game} onClick={() => toggleGame(game)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${draft.favoriteGames.includes(game) ? "bg-primary/15 border-primary/40 text-primary" : "bg-secondary border-border text-muted-foreground hover:border-muted-foreground/30"}`}>
                  {game}
                </button>
              ))}
            </div>
          ) : (
            current.favoriteGames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {current.favoriteGames.map(game => (
                  <span key={game} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 border border-primary/20 text-primary">
                    {game}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin juegos favoritos</p>
            )
          )}
        </div>

        {/* Cerrar sesión */}
        {!editing && (
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 active:scale-95 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}
