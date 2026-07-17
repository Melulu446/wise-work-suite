import { ShieldAlert } from "lucide-react";
import { RESPONSIBLE_AI_NOTICE } from "@/lib/prompts";

export function ResponsibleAINotice() {
  return (
    <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div>
        <div className="font-semibold text-foreground">Responsible AI</div>
        <p className="mt-1 text-muted-foreground">{RESPONSIBLE_AI_NOTICE}</p>
      </div>
    </div>
  );
}