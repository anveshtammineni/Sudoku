import { useEffect, useState } from 'react';
import { Crown, LogOut, Zap } from 'lucide-react';
import { getDashboard } from './api/userApi';
import { AuthPanel } from './components/AuthPanel';
import { Celebration } from './components/Celebration';
import { Dashboard } from './components/Dashboard';
import { GameControls } from './components/GameControls';
import { Layout } from './components/Layout';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { SudokuBoard } from './components/SudokuBoard';
import { StatsBar } from './components/StatsBar';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './context/AuthContext';
import { useGame } from './context/GameContext';
import { useTheme } from './hooks/useTheme';
import type { DashboardData, Difficulty } from './types';

export default function App() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const game = useGame();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !game.gameId && !game.loading) {
      void game.startNewGame('easy');
    }
  }, [authLoading, game.gameId, game.loading, game.startNewGame]);

  useEffect(() => {
    if (!user) {
      setDashboard(null);
      return;
    }

    setDashboardLoading(true);
    void getDashboard()
      .then((data) => setDashboard(data))
      .finally(() => setDashboardLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <Layout>
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10">
          <LoadingSkeleton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Celebration active={game.celebration} />
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-cyan-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Sudoku Nexus</p>
                  <h1 className="text-2xl font-semibold text-white">Strategic puzzle arena</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              {user ? (
                <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/15">
                  <LogOut size={16} />
                  Logout
                </button>
              ) : null}
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                {theme === 'dark' ? 'Dark' : 'Light'} Theme
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-6 xl:grid-cols-[1.25fr_.95fr]">
          <section className="space-y-5">
            <StatsBar />
            {game.loading ? <LoadingSkeleton /> : <SudokuBoard />}
            <GameControls />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">State</div>
                <div className="mt-2 text-lg font-semibold text-white">{game.paused ? 'Paused' : game.completed ? 'Completed' : 'Active'}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Accuracy</div>
                <div className="mt-2 text-lg font-semibold text-white">{Math.max(0, 100 - game.mistakes * 3)}%</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Hints</div>
                <div className="mt-2 text-lg font-semibold text-white">{game.hintsUsed}</div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            {user ? <Dashboard data={dashboard} loading={dashboardLoading} /> : <AuthPanel />}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/5 to-emerald-400/10 p-5 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
              <div className="flex items-center gap-3 text-slate-100">
                <Crown size={18} className="text-amber-300" />
                <h2 className="text-lg font-semibold">Play, improve, repeat</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Solve puzzles, track time, earn scores, and keep your best runs synced when you log in.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </Layout>
  );
}
