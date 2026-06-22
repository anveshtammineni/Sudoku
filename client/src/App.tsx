import { useEffect, useState } from 'react';
import { Crown, Lock, LogOut, Play, RefreshCw, Sparkles, Zap } from 'lucide-react';
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
  const [gameStarted, setGameStarted] = useState(false);
  const [startDifficulty, setStartDifficulty] = useState<Difficulty>('easy');
  const [guestNotice, setGuestNotice] = useState<string | null>(null);
  const { progressByDifficulty, unlockTargets, maxMistakes, lastSavedOutcomeTick } = game;
  const isOverlayVisible = gameStarted && (game.paused || game.completed || game.lost);

  useEffect(() => {
    if (!user) {
      setGameStarted(false);
      return;
    }

    if (!gameStarted && !game.gameId && !game.loading) {
      void game.startNewGame('easy').then(() => setGameStarted(true));
    }
  }, [user, gameStarted, game.gameId, game.loading, game.startNewGame]);

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

  useEffect(() => {
    if (!user || lastSavedOutcomeTick === 0) {
      return;
    }

    setDashboardLoading(true);
    void getDashboard()
      .then((data) => setDashboard(data))
      .finally(() => setDashboardLoading(false));
  }, [user, lastSavedOutcomeTick]);

  useEffect(() => {
    if (!guestNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setGuestNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [guestNotice]);

  async function handleStartGame() {
    if (!user) {
      setGuestNotice("Log in to start playing, or create an account if you're new here");
      return;
    }

    if (!game.isDifficultyUnlocked(startDifficulty)) {
      return;
    }

    await game.startNewGame(startDifficulty);
    setGameStarted(true);
  }

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
      {guestNotice ? (
        <div className="fixed right-4 top-4 z-[80] max-w-md rounded-2xl border border-amber-300/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-100 shadow-xl backdrop-blur-xl">
          {guestNotice}
        </div>
      ) : null}
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 px-5 py-4 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-cyan-700 dark:text-cyan-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-700/80 dark:text-cyan-200/70 font-semibold">Sudoku Nexus</p>
                  <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Strategic puzzle arena</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              {user ? (
                <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-full border border-slate-300/85 bg-slate-200/50 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-300/60 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15">
                  <LogOut size={16} />
                  Logout
                </button>
              ) : null}
              <div className="rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                {theme === 'dark' ? 'Dark' : 'Light'} Theme
              </div>
            </div>
          </div>
        </header>

        <main className={`grid gap-6 xl:grid-cols-[1.25fr_.95fr] ${isOverlayVisible ? 'pointer-events-none select-none blur-sm' : ''}`}>
          <section className="space-y-5">
            {!gameStarted ? (
              <div className="space-y-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-6 shadow-glow backdrop-blur-xl">
                <div>
                  <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80">Ready to Play</div>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-800 dark:text-white">Start your next Sudoku challenge</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Your player dashboard is available on the right. Choose a mode and click Start Game to begin.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/50 dark:bg-slate-950/30 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Difficulty</span>
                    <select
                      value={startDifficulty}
                      onChange={(event) => setStartDifficulty(event.target.value as Difficulty)}
                      className="w-full bg-transparent text-base font-semibold text-slate-800 dark:text-white outline-none"
                    >
                      {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((mode) => (
                        <option key={mode} value={mode} disabled={!game.isDifficultyUnlocked(mode)} className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white">
                          {mode[0].toUpperCase() + mode.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="button" onClick={() => void handleStartGame()} disabled={game.loading} className="control-button accent h-full justify-center">
                    <Play size={16} />
                    {game.loading ? 'Starting...' : 'Start Game'}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-cyan-400/30 dark:border-cyan-400/20 bg-cyan-400/15 dark:bg-cyan-400/10 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-100">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Unlock Medium</div>
                    <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.easy, unlockTargets.medium)}/{unlockTargets.medium} Easy wins</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-400/15 dark:bg-emerald-400/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-100">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200/80">Unlock Hard</div>
                    <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.medium, unlockTargets.hard)}/{unlockTargets.hard} Medium wins</div>
                  </div>
                  <div className="rounded-2xl border border-amber-400/30 dark:border-amber-400/20 bg-amber-400/15 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-100">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200/80">Unlock Expert</div>
                    <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.hard, unlockTargets.expert)}/{unlockTargets.expert} Hard wins</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <StatsBar />
                {game.loading ? <LoadingSkeleton /> : <SudokuBoard />}
                <GameControls />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-4 shadow-glow backdrop-blur-xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80">State</div>
                    <div className="mt-2 text-lg font-semibold text-slate-800 dark:text-white">{game.lost ? 'Lost' : game.paused ? 'Paused' : game.completed ? 'Completed' : 'Active'}</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-4 shadow-glow backdrop-blur-xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80">Accuracy</div>
                    <div className="mt-2 text-lg font-semibold font-mono text-slate-800 dark:text-white">{Math.max(0, 100 - game.mistakes * 3)}%</div>
                  </div>
                  <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-4 shadow-glow backdrop-blur-xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80">Mistake Limit</div>
                    <div className="mt-2 text-lg font-semibold font-mono text-slate-800 dark:text-white">{game.mistakes}/{maxMistakes}</div>
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="space-y-5">
            {user ? <Dashboard data={dashboard} loading={dashboardLoading} /> : <AuthPanel />}
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-cyan-400/10 via-slate-100/70 dark:via-white/5 to-emerald-400/10 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <Crown size={18} className="text-amber-600 dark:text-amber-300" />
                <h2 className="text-lg font-semibold">Play, improve, repeat</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Solve puzzles, track time, earn scores, and keep your best runs synced when you log in.
              </p>
            </div>
          </aside>
        </main>

        {isOverlayVisible ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 px-4 backdrop-blur-xl">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 dark:border-white/15 bg-slate-100/95 dark:bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
              {game.completed ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-400/15 dark:bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-100">
                    <Sparkles size={14} />
                    Puzzle Completed
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-800 dark:text-white">Choose your next puzzle</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Restart this board or start a new mode. Higher difficulties unlock as you complete the modes before them.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={game.restartPuzzle} className="control-button justify-center">
                      <RefreshCw size={16} />
                      Play Again
                    </button>
                    {game.unlockedDifficulties.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        disabled={game.loading}
                        onClick={() => void game.startNewGame(mode)}
                        className="control-button accent justify-center"
                      >
                        <Play size={16} />
                        New {mode[0].toUpperCase() + mode.slice(1)} Game
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-cyan-400/30 dark:border-cyan-400/20 bg-cyan-400/15 dark:bg-cyan-400/10 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-100">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Unlock Medium</div>
                      <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.easy, unlockTargets.medium)}/{unlockTargets.medium} Easy wins</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-400/15 dark:bg-emerald-400/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-100">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200/80">Unlock Hard</div>
                      <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.medium, unlockTargets.hard)}/{unlockTargets.hard} Medium wins</div>
                    </div>
                    <div className="rounded-2xl border border-amber-400/30 dark:border-amber-400/20 bg-amber-400/15 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-100">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200/80">Unlock Expert</div>
                      <div className="mt-1 font-semibold font-mono">{Math.min(progressByDifficulty.hard, unlockTargets.expert)}/{unlockTargets.expert} Hard wins</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    <Lock size={16} className="text-cyan-700 dark:text-cyan-200" />
                    <span className="font-mono text-xs">Win {unlockTargets.medium} Easy to open Medium, {unlockTargets.hard} Medium to open Hard, and {unlockTargets.expert} Hard to open Expert.</span>
                  </div>
                </>
              ) : game.lost ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 dark:border-rose-400/25 bg-rose-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-800 dark:text-rose-100">
                    Game Over
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-800 dark:text-white">You lost this round</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    You reached the mistake limit of <span className="font-mono">{maxMistakes}</span>. Restart this puzzle or start a fresh game.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={game.restartPuzzle} className="control-button justify-center">
                      <RefreshCw size={16} />
                      Try Again
                    </button>
                    <button type="button" onClick={() => void game.startNewGame(game.difficulty)} className="control-button accent justify-center">
                      <Play size={16} />
                      New Game
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 dark:border-cyan-400/20 bg-cyan-400/15 dark:bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800 dark:text-cyan-100">
                    Paused
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold text-slate-800 dark:text-white">Game paused</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    The board is locked while paused. Resume to continue exactly where you stopped.
                  </p>

                  <div className="mt-6 flex justify-center">
                    <button type="button" onClick={game.togglePause} className="control-button accent min-w-40 justify-center">
                      <Play size={16} />
                      Resume
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
