import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 animate-fade-in">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="group grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary animate-scale-in transition-transform duration-300 hover:scale-105 hover:bg-primary/15">
            <Icon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}