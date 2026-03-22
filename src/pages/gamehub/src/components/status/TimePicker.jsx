import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TIME_OPTIONS = [
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "2 horas", value: 120 },
  { label: "Esta noche", value: -1 },
];

export default function TimePicker({ selected, onSelect }) {
  const [customInput, setCustomInput] = useState("");

  const handleCustomSubmit = () => {
    const mins = parseInt(customInput, 10);
    if (!isNaN(mins) && mins > 0) {
      onSelect(mins);
      setCustomInput("");
    }
  };

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2">
        {TIME_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200",
              selected === opt.value
                ? "border-accent bg-accent/15 text-accent shadow-md shadow-accent/10"
                : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          type="number"
          min="1"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
          placeholder="Minutos personalizados..."
          className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
        />
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleCustomSubmit}
          className="px-4 rounded-xl border border-accent bg-accent/15 text-accent text-sm font-medium hover:bg-accent/25 transition-all"
        >
          OK
        </motion.button>
      </div>
    </div>
  );
}
