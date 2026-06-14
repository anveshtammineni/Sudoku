import { Clock3, FlagTriangleRight, Lightbulb, ShieldAlert } from 'lucide-react';
import { formatTime } from '../utils/sudoku';
import { useGame } from '../context/GameContext';

export function StatsBar() {
  const { timeElapsed, mistakes, hintsUsed, completionPercent, difficulty, maxHints, remainingHints, maxMistakes } = useGame();

  const items = [
    { label: 'Timer', value: formatTime(timeElapsed), icon: Clock3 },
    { label: 'Mistakes', value: `${mistakes}/${maxMistakes}`, icon: ShieldAlert },
    { label: 'Hints', value: `${hintsUsed}/${maxHints}`, icon: Lightbulb },
    { label: 'Progress', value: `${completionPercent}%`, icon: FlagTriangleRight },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl dark:bg-slate-950/50 xl:col-span-1">
        <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Difficulty</div>
        <div className="mt-1 text-lg font-semibold capitalize text-white">{difficulty}</div>
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl dark:bg-slate-950/50">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-300">
              <span>{item.label}</span>
              <Icon size={14} />
            </div>
            <div className="mt-2 text-lg font-semibold font-mono text-white">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
