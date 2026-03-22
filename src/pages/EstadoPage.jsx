import { useState, useEffect } from "react";
import { Gamepad2, Clock, WifiOff, Sparkles } from "lucide-react";
import StatusOption from "@/components/status/StatusOption";
import GamePicker from "@/components/status/GamePicker";
import TimePicker from "@/components/status/TimePicker";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getGame } from "@/lib/games";

export default function EstadoPage() {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState("offline");
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cargar estado guardado al montar
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setActiveStatus(data.status || "offline");
        if (data.current_game) {
          // Buscar el objeto juego por nombre
          const game = Object.values(getGame ? {} : {}).find(g => g.name === data.current_game)
            || { name: data.current_game, icon: "🎮", id: data.current_game };
          setSelectedGame(game);
        }
        if (data.scheduled_time) setSelectedTime(data.scheduled_time);
      }
      setLoaded(true);
    });
  }, [user]);

  const saveToFirestore = async (status, game, time) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        status,
        current_game: game?.name || null,
        scheduled_time: time || null,
        lastSeen: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleGameSelect = async (game) => {
    setSelectedGame(game);
    setActiveStatus("playing");
    setMenuOpen(null);
    await saveToFirestore("playing", game, null);
  };

  const handleScheduledConfirm = async () => {
    setActiveStatus("scheduled");
    setMenuOpen(null);
    await saveToFirestore("scheduled", selectedGame, selectedTime);
  };

  const handleOptionClick = (status) => {
    if (status === "offline") {
      setActiveStatus("offline");
      setSelectedGame(null);
      setSelectedTime(null);
      setMenuOpen(null);
      saveToFirestore("offline", null, null);
      return;
    }
    setMenuOpen(prev => prev === status ? null : status);
  };

  if (!loaded) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">GameHub</span>
        {saving && <span className="text-xs text-muted-foreground ml-auto">Guardando...</span>}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">
        Hola, {user?.displayName?.split(" ")[0] || "gamer"} 👋
      </h1>
      <p className="text-sm text-muted-foreground mb-6">¿Qué vas a hacer hoy?</p>

      <div className="flex flex-col gap-3">
        <StatusOption
          icon={Gamepad2}
          title={activeStatus === "playing" && selectedGame ? `Jugando a ${selectedGame.name}` : "Jugando a..."}
          subtitle="Dile a tus amigos qué estás jugando"
          active={activeStatus === "playing"}
          onClick={() => handleOptionClick("playing")}
        >
          {menuOpen === "playing" && (
            <GamePicker selected={selectedGame?.id} onSelect={handleGameSelect} />
          )}
        </StatusOption>

        <StatusOption
          icon={Clock}
          title={activeStatus === "scheduled" && selectedGame ? `${selectedGame.name}${selectedTime ? " · en " + selectedTime + " min" : ""}` : "Voy a jugar en..."}
          subtitle="Programa cuándo vas a jugar"
          active={activeStatus === "scheduled"}
          onClick={() => handleOptionClick("scheduled")}
        >
          {menuOpen === "scheduled" && (
            <div onClick={e => e.stopPropagation()}>
              <GamePicker
                selected={selectedGame?.id}
                onSelect={(game) => setSelectedGame(game)}
              />
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">¿CUÁNDO?</p>
                <TimePicker selected={selectedTime} onSelect={setSelectedTime} />
              </div>
              <button
                onClick={handleScheduledConfirm}
                className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                OK
              </button>
            </div>
          )}
        </StatusOption>

        <StatusOption
          icon={WifiOff}
          title="Offline"
          subtitle="No disponible ahora"
          active={activeStatus === "offline"}
          onClick={() => handleOptionClick("offline")}
        />

        {activeStatus !== "offline" && selectedGame && menuOpen === null && (
          <div className="mt-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-primary font-medium">
              {activeStatus === "playing" ? "🎮" : "⏰"} {selectedGame.icon} {selectedGame.name}
              {activeStatus === "scheduled" && selectedTime ? ` · en ${selectedTime} min` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
