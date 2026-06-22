import { Lock, Pause, Play, RefreshCw, Sparkles, Volume2, VolumeX, WandSparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

const difficulties = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
  { label: 'Expert', value: 'expert' },
] as const;

export function GameControls() {
  const {
    difficulty,
    loading,
    paused,
    autoCheck,
    soundEnabled,
    hintsUsed,
    remainingHints,
    maxHints,
    progressByDifficulty,
    unlockTargets,
    unlockedDifficulties,
    isDifficultyUnlocked,
    startNewGame,
    restartPuzzle,
    togglePause,
    toggleAutoCheck,
    toggleSound,
    requestHint,
    checkBoard,
  } = useGame();

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-4 shadow-glow backdrop-blur-xl">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/50 dark:bg-slate-950/30 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Difficulty</span>
          <select
            value={difficulty}
            onChange={(event) => void startNewGame(event.target.value as typeof difficulty)}
            className="w-full bg-transparent text-base font-semibold text-slate-800 dark:text-white outline-none"
          >
            {difficulties.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={!isDifficultyUnlocked(option.value)}
                className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={() => void startNewGame(difficulty)} disabled={loading} className="control-button">
          <Sparkles size={16} />
          New Game
        </button>
        <button type="button" onClick={restartPuzzle} disabled={loading} className="control-button">
          <RefreshCw size={16} />
          Restart
        </button>
        <button type="button" onClick={togglePause} className="control-button">
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => void requestHint()}
          disabled={remainingHints <= 0}
          className="control-button accent"
        >
          <WandSparkles size={16} />
          Hint ({hintsUsed}/{maxHints})
        </button>
        <button type="button" onClick={() => void checkBoard()} className="control-button accent">
          <Sparkles size={16} />
          Check
        </button>
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/50 dark:bg-slate-950/30 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 sm:col-span-2 xl:col-span-2">
          <Lock size={16} />
          <span>
            Modes unlocked: <span className="font-semibold text-slate-850 dark:text-white">{unlockedDifficulties.map((item) => item[0].toUpperCase() + item.slice(1)).join(', ')}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/30 dark:border-cyan-400/20 bg-cyan-400/15 dark:bg-cyan-400/10 px-4 py-3 text-sm text-cyan-800 dark:text-cyan-100">
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/80">Unlock Medium</div>
          <div className="mt-1 font-semibold">{Math.min(progressByDifficulty.easy, unlockTargets.medium)}/{unlockTargets.medium} Easy wins</div>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 dark:border-emerald-400/20 bg-emerald-400/15 dark:bg-emerald-400/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-100">
          <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200/80">Unlock Hard</div>
          <div className="mt-1 font-semibold">{Math.min(progressByDifficulty.medium, unlockTargets.hard)}/{unlockTargets.hard} Medium wins</div>
        </div>
        <div className="rounded-2xl border border-amber-400/30 dark:border-amber-400/20 bg-amber-400/15 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-100">
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200/80">Unlock Expert</div>
          <div className="mt-1 font-semibold">{Math.min(progressByDifficulty.hard, unlockTargets.expert)}/{unlockTargets.expert} Hard wins</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <button type="button" onClick={toggleAutoCheck} className="switch-pill">
          <span>Auto-check</span>
          <span className={autoCheck ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-500 dark:text-slate-400'}>{autoCheck ? 'On' : 'Off'}</span>
        </button>
        <button type="button" onClick={toggleSound} className="switch-pill">
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>Sound</span>
          <span className={soundEnabled ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-500 dark:text-slate-400'}>{soundEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>
    </div>
  );
}
