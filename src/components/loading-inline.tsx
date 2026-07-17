import { Loader2 } from "lucide-react";

export function LoadingInline({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}