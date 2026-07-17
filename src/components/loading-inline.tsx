export function LoadingInline({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm animate-fade-in">
      <span className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: `ww-bounce-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </span>
      <span className="shimmer-text font-medium">{label}</span>
    </div>
  );
}