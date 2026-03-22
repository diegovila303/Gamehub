import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { LogOut, Edit2, Check, X } from "lucide-react";

const GAMES = ["Valorant","Fortnite","League of Legends","Minecraft","CS2","Apex Legends","Rocket League","GTA V","Call of Duty","FIFA","EA FC","Overwatch 2","Elden Ring","Cyberpunk 2077"];
const BANNERS = ["from-violet-600 to-indigo-600","from-pink-600 to-rose-600","from-emerald-600 to-teal-600","from-amber-500 to-orange-600","from-blue-600 to-cyan-600","from-purple-600 to-pink-600","from-slate-700 to-slate-900","from-red-600 to-orange-600"];

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ username: "", bio: "", favoriteGames: [], banner: BANNERS[0] });
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        const p = { username: d.username || d.name?.split(" ")[0]?.toLowerCase() || "", bio: d.bio || "", favoriteGames: d.favoriteGames || [], banner: d.banner || BANNERS[0] };
        setProfile(p); setDraft(p);
      }
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "users", user.uid), { username: draft.username, bio: draft.bio, favoriteGames: draft.favoriteGames, banner: draft.banner });
    setProfile(draft); setSaving(false); setEditing(false);
  };

  const toggleGame = (game) => setDraft(prev => ({ ...prev, favoriteGames: prev.favoriteGames.includes(game) ? prev.favoriteGames.filter(g => g !== game) : prev.favoriteGames.length < 5 ? [...prev.favoriteGames, game] : prev.favoriteGames }));
  const current = editing ? draft : profile;

  return (
    <div className="pb-24">
      <div className={`h-28 bg-gradient-to-r ${current.banner} relative`}>
        {editing && (
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            {BANNERS.map((b, i) => (
              <button key={i} onClick={() => setDraft(prev => ({ ...prev, banner: b }))} className={`w-6 h-6 rounded-full bg-gradient-to-r ${b} border-2 transition-all ${draft.banner === b ? "border-white scale-110" : "border-transparent"}`} />
            ))}
          </div>
        )}
      </div>
      <div className="px-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-background bg-secondary overflow-hidden">
            {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">{(user?.displayName || "?")[0].toUpperCase()}</div>}
          </div>
          <div className="flex gap-2 mb-1">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-all"><Edit2 className="w-3.5 h-3.5" /> Editar</button>
            ) : (
              <>
                <button onClick={() => { setDraft(profile); setEditing(false); }} className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
                <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"><Check className="w-3.5 h-3.5" /> {saving ? "..." : "Guardar"}</button>
              </>
            )}
          </div>
        </div>
        <div className="mb-4">
          <p className="font-bold text-xl text-foreground">{user?.displayName}</p>
          {editing ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-muted-foreground text-sm">@</span>
              <input value={draft.username} onChange={e => setDraft(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s/g, "") }))} className="bg-card border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary transition-colors" placeholder="username" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">@{current.username || "sin username"}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sobre mi</p>
          {editing ? (
            <textarea value={draft.bio} onChange={e => setDraft(prev => ({ ...prev, bio: e.target.value }))} placeholder="Cuentale algo a tus amigos..." rows={3} className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
          ) : (
            <p className="text-sm text-foreground/80">{current.bio || <span className="text-muted-foreground italic">Sin bio todavia</span>}</p>
          )}
        </div>
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Juegos favoritos {editing && <span className="normal-case font-normal">({draft.favoriteGames.length}/5)</span>}</p>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {GAMES.map(game => (
                <button key={game} onClick={() => toggleGame(game)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${draft.favoriteGames.includes(game) ? "bg-primary/15 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"}`}>{game}</button>
              ))}
            </div>
          ) : (
            current.favoriteGames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {current.favoriteGames.map(game => <span key={game} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 border border-primary/20 text-primary">{game}</span>)}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">Sin juegos favoritos</p>
          )}
        </div>
        {!editing && <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all text-sm font-medium"><LogOut className="w-4 h-4" /> Cerrar sesion</button>}
      </div>
    </div>
  );
}
