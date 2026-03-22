import { useState } from "react";
import { WifiOff, Send, LogOut, CheckCircle } from "lucide-react";

const USER = {
  name: "Diego Vila",
  email: "diegovila303@gmail.com",
  status: "offline",
};

export default function PerfilPage() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setSent(true);
    setInviteEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    // Limpiar datos locales
    setTimeout(() => {
      localStorage.clear();
      // Recargar la página (simula cerrar sesión)
      window.location.reload();
    }, 800);
  };

  const initial = USER.name[0].toUpperCase();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground mb-4">Perfil</h1>

      {/* Tarjeta de usuario */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-foreground">{USER.name}</p>
            <p className="text-sm text-muted-foreground">{USER.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5">
          <WifiOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Offline</span>
        </div>
      </div>

      {/* Invitar amigos */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-3">
        <p className="font-semibold text-foreground mb-1">Invitar amigos</p>
        <p className="text-sm text-muted-foreground mb-3">Envía una invitación por email para que se unan</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleInvite()}
            placeholder="email@ejemplo.com"
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleInvite}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
          >
            {sent ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        {sent && (
          <p className="text-xs text-primary mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Invitación enviada correctamente
          </p>
        )}
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 active:scale-95 transition-all disabled:opacity-60"
      >
        <LogOut className="w-4 h-4" />
        {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
    </div>
  );
}
