import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed bg-card/50 p-10 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}