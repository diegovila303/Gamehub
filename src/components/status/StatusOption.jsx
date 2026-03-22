import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatusOption({ icon: Icon, title, subtitle, active, onClick, children }) {
  return (
    <div className={cn(
      "w-full rounded-2xl border transition-all duration-300",
      active
        ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
        : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary/50"
    )}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="w-full text-left p-5"
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
          </div>
        </div>
      </motion.button>
      {children && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}
