import { Pause, Play, RefreshCw, RotateCcw, RotateCw, Sparkles, Volume2, VolumeX, WandSparkles } from 'lucide-react';
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
    startNewGame,
    restartPuzzle,
    togglePause,
    toggleAutoCheck,
    toggleSound,
    undo,
    redo,
    requestHint,
    checkBoard,
  } = useGame();

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/55">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-cyan-200/80">Difficulty</span>
          <select
            value={difficulty}
            onChange={(event) => void startNewGame(event.target.value as typeof difficulty)}
            className="w-full bg-transparent text-base font-semibold text-white outline-none"
          >
            {difficulties.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-950 text-white">
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
        <button type="button" onClick={undo} className="control-button muted">
          <RotateCcw size={16} />
          Undo
        </button>
        <button type="button" onClick={redo} className="control-button muted">
          <RotateCw size={16} />
          Redo
        </button>
        <button type="button" onClick={() => void requestHint()} className="control-button accent">
          <WandSparkles size={16} />
          Hint
        </button>
        <button type="button" onClick={() => void checkBoard()} className="control-button accent">
          <Sparkles size={16} />
          Check
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <button type="button" onClick={toggleAutoCheck} className="switch-pill">
          <span>Auto-check</span>
          <span className={autoCheck ? 'text-emerald-300' : 'text-slate-400'}>{autoCheck ? 'On' : 'Off'}</span>
        </button>
        <button type="button" onClick={toggleSound} className="switch-pill">
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>Sound</span>
          <span className={soundEnabled ? 'text-emerald-300' : 'text-slate-400'}>{soundEnabled ? 'On' : 'Off'}</span>
        </button>
      </div>
    </div>
  );
}
