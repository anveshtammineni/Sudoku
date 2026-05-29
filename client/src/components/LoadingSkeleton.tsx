export function LoadingSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/60">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/5 shadow-glow" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}
