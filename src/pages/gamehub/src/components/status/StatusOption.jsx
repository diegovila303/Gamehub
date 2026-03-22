import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatusOption({ icon: Icon, title, subtitle, active, onClick, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-5 border transition-all duration-300",
        active
          ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          active ? "bg-primary/20" : "bg-secondary"
        )}>
          <Icon className={cn("w-6 h-6", active ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-semibold text-base", active ? "text-foreground" : "text-foreground/80")}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          {children}
        </div>
        {!active && (
          <svg className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        )}
        {active && !children && (
          <svg className="w-5 h-5 text-primary mt-0.5 shrink-0 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        )}
      </div>
    </motion.button>
  );
}
