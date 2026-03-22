import { useState } from "react";
import { Gamepad2, Clock, WifiOff, Sparkles } from "lucide-react";
import StatusOption from "@/components/status/StatusOption";
import GamePicker from "@/components/status/GamePicker";
import TimePicker from "@/components/status/TimePicker";
import { GameStatus, User } from "@/lib/entities";

export default function EstadoPage() {
  const [activeStatus, setActiveStatus] = useState("offline");
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleTimeSelect = (mins) => {
    setSelectedTime(mins);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    if (status !== "playing") setSelectedGame(null);
    if (status !== "scheduled") setSelectedTime(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
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
          title="Jugando a..."
          subtitle="Dile a tus amigos qué estás jugando"
          active={activeStatus === "playing"}
          onClick={() => handleStatusChange(activeStatus === "playing" ? "offline" : "playing")}
        >
          {activeStatus === "playing" && (
            <GamePicker
              selected={selectedGame?.id}
              onSelect={handleGameSelect}
            />
          )}
        </StatusOption>

        {/* Voy a jugar */}
        <StatusOption
          icon={Clock}
          title="Voy a jugar en..."
          subtitle="Programa cuándo vas a jugar"
          active={activeStatus === "scheduled"}
          onClick={() => handleStatusChange(activeStatus === "scheduled" ? "offline" : "scheduled")}
        >
          {activeStatus === "scheduled" && (
            <>
              <GamePicker
                selected={selectedGame?.id}
                onSelect={handleGameSelect}
              />
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">¿CUÁNDO?</p>
                <TimePicker selected={selectedTime} onSelect={handleTimeSelect} />
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
      </div>
    </div>
  );
}
