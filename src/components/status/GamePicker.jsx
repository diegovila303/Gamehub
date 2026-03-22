import { GAMES } from "@/lib/games";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function GamePicker({ selected, onSelect }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-3">SELECCIONA UN JUEGO</p>
      <div className="grid grid-cols-3 gap-2">
        {GAMES.map((game) => (
          <motion.button
            key={game.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(game)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200",
              selected === game.id
                ? "border-primary bg-primary/15 shadow-md shadow-primary/10"
                : "border-border bg-secondary/50 hover:border-muted-foreground/30"
            )}
          >
            <span className="text-2xl leading-none">{game.icon}</span>
            <span className={cn(
              "text-[10px] font-medium leading-tight",
              selected === game.id ? "text-primary" : "text-muted-foreground"
            )}>
              {game.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
