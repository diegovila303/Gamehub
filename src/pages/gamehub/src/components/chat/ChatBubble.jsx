import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ChatBubble({ message, isMine }) {
  return (
    <div className={cn("flex mb-3", isMine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] px-4 py-2.5 rounded-2xl",
        isMine
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-secondary text-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1",
          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          {message.created_date && format(new Date(message.created_date), "HH:mm")}
        </p>
      </div>
    </div>
  );
}
