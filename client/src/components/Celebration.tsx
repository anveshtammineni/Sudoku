export function Celebration({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-10 mx-auto flex max-w-2xl justify-center px-4 text-center">
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-6 py-3 text-sm font-semibold tracking-[0.2em] text-emerald-100 shadow-glow animate-pulseGlow">
          PUZZLE COMPLETED
        </div>
      </div>
      <div className="absolute inset-0">
        {Array.from({ length: 28 }, (_, index) => (
          <span
            key={index}
            className="celebration-piece"
            style={{
              left: `${(index * 7.5) % 100}%`,
              animationDelay: `${(index % 9) * 0.11}s`,
              background: ['#38bdf8', '#f59e0b', '#34d399', '#fb7185', '#e879f9'][index % 5],
            }}
          />
        ))}
      </div>
    </div>
  );
}
