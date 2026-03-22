import { useState, useEffect } from "react";
import { Gamepad2, Clock, WifiOff, Sparkles } from "lucide-react";
import StatusOption from "@/components/status/StatusOption";
import GamePicker from "@/components/status/GamePicker";
import TimePicker from "@/components/status/TimePicker";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function EstadoPage() {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState("offline");
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  const saveToFirestore = async (status, game, time) => {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        status,
        current_game: game?.name || null,
        scheduled_time: time || null,
        lastSeen: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Error guardando estado:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    let newStatus = activeStatus === status ? "offline" : status;
    let newGame = selectedGame;
    let newTime = selectedTime;

    if (newStatus === "offline") {
      newGame = null;
      newTime = null;
    }
    if (newStatus !== "scheduled") newTime = null;

    setActiveStatus(newStatus);
    setSelectedGame(newGame);
    setSelectedTime(newTime);
    await saveToFirestore(newStatus, newGame, newTime);
  };

  const handleGameSelect = async (game) => {
    setSelectedGame(game);
    await saveToFirestore(activeStatus, game, selectedTime);
  };

  const handleTimeSelect = async (time) => {
    setSelectedTime(time);
    await saveToFirestore(activeStatus, selectedGame, time);
  };

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
          title={selectedGame && activeStatus === "playing" ? `Jugando a ${selectedGame.name}` : "Jugando a..."}
          subtitle="Dile a tus amigos qué estás jugando"
          active={activeStatus === "playing"}
          onClick={() => handleStatusChange("playing")}
        >
          {activeStatus === "playing" && (
            <GamePicker selected={selectedGame?.id} onSelect={handleGameSelect} />
          )}
        </StatusOption>

        <StatusOption
          icon={Clock}
          title="Voy a jugar en..."
          subtitle="Programa cuándo vas a jugar"
          active={activeStatus === "scheduled"}
          onClick={() => handleStatusChange("scheduled")}
        >
          {activeStatus === "scheduled" && (
            <>
              <GamePicker selected={selectedGame?.id} onSelect={handleGameSelect} />
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">¿CUÁNDO?</p>
                <TimePicker selected={selectedTime} onSelect={handleTimeSelect} />
              </div>
            </>
          )}
        </StatusOption>

        <StatusOption
          icon={WifiOff}
          title="Offline"
          subtitle="No disponible ahora"
          active={activeStatus === "offline"}
          onClick={() => handleStatusChange("offline")}
        />

        {activeStatus !== "offline" && selectedGame && (
          <div className="mt-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-primary font-medium">
              {activeStatus === "playing" ? "🎮" : "⏰"} Estado guardado — {selectedGame.icon} {selectedGame.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
