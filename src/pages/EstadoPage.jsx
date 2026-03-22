import { useState, useEffect } from "react";
import { Gamepad2, Clock, WifiOff, Sparkles } from "lucide-react";
import StatusOption from "@/components/status/StatusOption";
import GamePicker from "@/components/status/GamePicker";
import TimePicker from "@/components/status/TimePicker";

const STORAGE_KEY = "gh_active_status";

export default function EstadoPage() {
  const [activeStatus, setActiveStatus] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "offline";
  });
  const [selectedGame, setSelectedGame] = useState(() => {
    const saved = localStorage.getItem("gh_selected_game");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const saved = localStorage.getItem("gh_selected_time");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, activeStatus);
  }, [activeStatus]);

  useEffect(() => {
    localStorage.setItem("gh_selected_game", JSON.stringify(selectedGame));
  }, [selectedGame]);

  useEffect(() => {
    localStorage.setItem("gh_selected_time", JSON.stringify(selectedTime));
  }, [selectedTime]);

  const handleStatusChange = (status) => {
    if (activeStatus === status) {
      setActiveStatus("offline");
    } else {
      setActiveStatus(status);
      if (status !== "playing" && status !== "scheduled") setSelectedGame(null);
      if (status !== "scheduled") setSelectedTime(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">GameHub</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Hola, Diego 👋</h1>
      <p className="text-sm text-muted-foreground mb-6">¿Qué vas a hacer hoy?</p>

      <div className="flex flex-col gap-3">
        {/* Jugando */}
        <StatusOption
          icon={Gamepad2}
          title={selectedGame && activeStatus === "playing" ? `Jugando a ${selectedGame.name}` : "Jugando a..."}
          subtitle="Dile a tus amigos qué estás jugando"
          active={activeStatus === "playing"}
          onClick={() => handleStatusChange("playing")}
        >
          {activeStatus === "playing" && (
            <GamePicker
              selected={selectedGame?.id}
              onSelect={(game) => setSelectedGame(game)}
            />
          )}
        </StatusOption>

        {/* Voy a jugar */}
        <StatusOption
          icon={Clock}
          title="Voy a jugar en..."
          subtitle="Programa cuándo vas a jugar"
          active={activeStatus === "scheduled"}
          onClick={() => handleStatusChange("scheduled")}
        >
          {activeStatus === "scheduled" && (
            <>
              <GamePicker
                selected={selectedGame?.id}
                onSelect={(game) => setSelectedGame(game)}
              />
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">¿CUÁNDO?</p>
                <TimePicker selected={selectedTime} onSelect={setSelectedTime} />
              </div>
            </>
          )}
        </StatusOption>

        {/* Offline */}
        <StatusOption
          icon={WifiOff}
          title="Offline"
          subtitle="No disponible ahora"
          active={activeStatus === "offline"}
          onClick={() => handleStatusChange("offline")}
        />

        {/* Confirmación visual */}
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
