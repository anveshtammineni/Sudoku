import { Crown, History, Medal, Trophy } from 'lucide-react';
import { formatTime } from '../utils/sudoku';
import type { DashboardData } from '../types';

export function Dashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  if (loading) {
    return <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/5 shadow-glow" />;
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200 shadow-glow backdrop-blur-xl">
        Sign in to sync your games, stats, and leaderboard progress.
      </div>
    );
  }

  const statCards = [
    { label: 'Win Rate', value: `${data.stats.winRate}%`, icon: Trophy },
    { label: 'Best Time', value: data.stats.bestTime ? formatTime(data.stats.bestTime) : '--:--', icon: Medal },
    { label: 'Games Played', value: String(data.stats.totalGames), icon: History },
    { label: 'Wins', value: String(data.stats.totalWins), icon: Crown },
  ];

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80 font-semibold">Player Dashboard</div>
          <h2 className="mt-1 text-xl font-semibold text-slate-800 dark:text-white">{data.user.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{data.user.email}</p>
        </div>
        <div className="rounded-full border border-emerald-400/40 dark:border-emerald-400/25 bg-emerald-400/15 dark:bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-100">
          Live Profile
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/40 dark:bg-slate-950/30 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                <span>{card.label}</span>
                <Icon size={14} />
              </div>
              <div className="mt-2 text-2xl font-semibold font-mono text-slate-800 dark:text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Recent Games</h3>
          <div className="space-y-3">
            {data.recentGames.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/30 dark:bg-slate-950/25 p-4 text-sm text-slate-600 dark:text-slate-400">No saved games yet.</div>
            ) : (
              data.recentGames.map((game) => (
                <div key={game.id} className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/30 dark:bg-slate-950/25 p-4 text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium capitalize text-slate-800 dark:text-white">{game.difficulty}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {game.status === 'lost' ? 'Lost' : game.completed ? 'Won' : game.status}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="font-mono">Time {formatTime(game.timeElapsed)}</span>
                    <span className="font-mono">Wins {game.completed ? 1 : 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Leaderboard</h3>
          <div className="space-y-3">
            {data.leaderboard.map((entry, index) => (
              <div key={`${entry.userId}-${entry.difficulty}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/30 dark:bg-slate-950/25 p-4 text-sm text-slate-700 dark:text-slate-200">
                <div>
                  <div className="font-medium text-slate-800 dark:text-white">{entry.name}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{entry.difficulty}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold font-mono text-emerald-700 dark:text-emerald-200">{entry.wins}</div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">{formatTime(entry.bestTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
