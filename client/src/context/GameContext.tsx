import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getHint, getNewGame, saveGame, validateGame } from '../api/gameApi';
import { useSound } from '../hooks/useSound';
import type { Board, Difficulty, GameSession } from '../types';
import { analyzeBoard, cloneBoard, findFirstEditableCell, isFixedCell } from '../utils/sudoku';

type SelectedCell = { row: number; col: number } | null;

type ProgressState = Record<Difficulty, number>;

const UNLOCK_TARGETS = {
  medium: 3,
  hard: 3,
  expert: 2,
} as const;

const HINT_LIMITS: Record<Difficulty, number> = {
  easy: 4,
  medium: 4,
  hard: 4,
  expert: 4,
};
const MAX_MISTAKES = 3;
const PROGRESS_STORAGE_KEY = 'sudoku-progress-v1';

const DEFAULT_PROGRESS: ProgressState = {
  easy: 0,
  medium: 0,
  hard: 0,
  expert: 0,
};

type GameContextValue = {
  gameId: string | null;
  difficulty: Difficulty;
  puzzle: Board;
  solution: Board;
  board: Board;
  selectedCell: SelectedCell;
  loading: boolean;
  paused: boolean;
  completed: boolean;
  lost: boolean;
  autoCheck: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  invalidCells: Array<{ row: number; col: number; value: number }>;
  completionPercent: number;
  celebration: boolean;
  soundEnabled: boolean;
  maxHints: number;
  maxMistakes: number;
  remainingHints: number;
  lastSavedOutcomeTick: number;
  progressByDifficulty: ProgressState;
  unlockTargets: typeof UNLOCK_TARGETS;
  unlockedDifficulties: Difficulty[];
  isDifficultyUnlocked: (difficulty: Difficulty) => boolean;
  startNewGame: (difficulty: Difficulty) => Promise<void>;
  selectCell: (row: number, col: number) => void;
  setCellValue: (value: number) => void;
  clearCell: () => void;
  undo: () => void;
  redo: () => void;
  restartPuzzle: () => void;
  togglePause: () => void;
  toggleAutoCheck: () => void;
  toggleSound: () => void;
  requestHint: () => Promise<void>;
  checkBoard: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
}

function loadProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }

  try {
    const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(stored) as Partial<ProgressState>;
    return {
      easy: Number(parsed.easy ?? 0),
      medium: Number(parsed.medium ?? 0),
      hard: Number(parsed.hard ?? 0),
      expert: Number(parsed.expert ?? 0),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Board>(emptyBoard);
  const [solution, setSolution] = useState<Board>(emptyBoard);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({ row: 0, col: 0 });
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lost, setLost] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [history, setHistory] = useState<Board[]>([]);
  const [future, setFuture] = useState<Board[]>([]);
  const [celebration, setCelebration] = useState(false);
  const [lastSavedOutcomeTick, setLastSavedOutcomeTick] = useState(0);
  const completionSaved = useRef(false);
  const lossSaved = useRef(false);
  const { enabled: soundEnabled, toggleSound, playClick, playError, playSuccess } = useSound();

  const analysis = useMemo(() => analyzeBoard(board, solution), [board, solution]);
  const maxHints = HINT_LIMITS[difficulty];
  const remainingHints = Math.max(0, maxHints - hintsUsed);
  const unlockedDifficulties = useMemo(() => {
    const unlocked: Difficulty[] = ['easy'];

    if (progress.easy >= UNLOCK_TARGETS.medium) {
      unlocked.push('medium');
    }
    if (progress.medium >= UNLOCK_TARGETS.hard) {
      unlocked.push('hard');
    }
    if (progress.hard >= UNLOCK_TARGETS.expert) {
      unlocked.push('expert');
    }

    return unlocked;
  }, [progress]);
  const isDifficultyUnlocked = (nextDifficulty: Difficulty) => unlockedDifficulties.includes(nextDifficulty);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!puzzle.some((row) => row.some(Boolean))) {
      return;
    }

    if (paused || completed) {
      return;
    }

    const interval = window.setInterval(() => setTimeElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [paused, completed, puzzle]);

  useEffect(() => {
    if (!analysis.isSolved || completed || lost) {
      return;
    }

    setCompleted(true);
    setPaused(true);
    setCelebration(true);
    playSuccess();
    setProgress((current) => ({
      ...current,
      [difficulty]: current[difficulty] + 1,
    }));

    if (!completionSaved.current) {
      completionSaved.current = true;
      void saveGame({
        gameId: gameId ?? undefined,
        difficulty,
        puzzle,
        solution,
        board,
        timeElapsed,
        mistakes,
        hintsUsed,
        completed: true,
        status: 'completed',
      })
        .catch(() => undefined)
        .finally(() => setLastSavedOutcomeTick((current) => current + 1));
    }

    const timeout = window.setTimeout(() => setCelebration(false), 4200);
    return () => window.clearTimeout(timeout);
  }, [analysis.isSolved, board, completed, difficulty, gameId, hintsUsed, lost, mistakes, paused, puzzle, solution, timeElapsed, playSuccess]);

  async function startNewGame(nextDifficulty: Difficulty) {
    if (!isDifficultyUnlocked(nextDifficulty)) {
      return;
    }

    setLoading(true);
    try {
      const result = await getNewGame(nextDifficulty);
      setGameId(result.gameId);
      setDifficulty(nextDifficulty);
      setPuzzle(result.puzzle);
      setSolution(result.solution);
      setBoard(cloneBoard(result.puzzle));
      setSelectedCell(findFirstEditableCell(result.puzzle));
      setPaused(false);
      setCompleted(false);
      setLost(false);
      setAutoCheck(true);
      setTimeElapsed(0);
      setMistakes(0);
      setHintsUsed(0);
      setHistory([]);
      setFuture([]);
      setCelebration(false);
      completionSaved.current = false;
      lossSaved.current = false;
    } finally {
      setLoading(false);
    }
  }

  function updateBoard(nextBoard: Board) {
    setHistory((current) => [...current, cloneBoard(board)]);
    setFuture([]);
    setBoard(nextBoard);
    if (autoCheck && soundEnabled) {
      playClick();
    }
  }

  function selectCell(row: number, col: number) {
    setSelectedCell({ row, col });
  }

  function setCellValue(value: number) {
    if (!selectedCell || paused || completed || lost) {
      return;
    }

    const { row, col } = selectedCell;
    if (isFixedCell(puzzle, row, col)) {
      return;
    }

    const nextBoard = cloneBoard(board);
    nextBoard[row][col] = value;
    updateBoard(nextBoard);

    if (value !== 0 && value !== solution[row][col]) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (soundEnabled) {
        playError();
      }

      if (nextMistakes >= MAX_MISTAKES) {
        setLost(true);
        setPaused(true);

        if (!lossSaved.current) {
          lossSaved.current = true;
          void saveGame({
            gameId: gameId ?? undefined,
            difficulty,
            puzzle,
            solution,
            board: nextBoard,
            timeElapsed,
            mistakes: nextMistakes,
            hintsUsed,
            completed: false,
            status: 'lost',
          })
            .catch(() => undefined)
            .finally(() => setLastSavedOutcomeTick((current) => current + 1));
        }
      }
    }
  }

  function clearCell() {
    setCellValue(0);
  }

  function undo() {
    setHistory((currentHistory) => {
      if (currentHistory.length === 0) {
        return currentHistory;
      }
      const previousBoard = currentHistory[currentHistory.length - 1];
      setFuture((currentFuture) => [cloneBoard(board), ...currentFuture]);
      setBoard(cloneBoard(previousBoard));
      return currentHistory.slice(0, -1);
    });
  }

  function redo() {
    setFuture((currentFuture) => {
      if (currentFuture.length === 0) {
        return currentFuture;
      }
      const [nextBoard, ...rest] = currentFuture;
      setHistory((currentHistory) => [...currentHistory, cloneBoard(board)]);
      setBoard(cloneBoard(nextBoard));
      return rest;
    });
  }

  function restartPuzzle() {
    setBoard(cloneBoard(puzzle));
    setSelectedCell(findFirstEditableCell(puzzle));
    setPaused(false);
    setCompleted(false);
    setLost(false);
    setTimeElapsed(0);
    setMistakes(0);
    setHintsUsed(0);
    setHistory([]);
    setFuture([]);
    setCelebration(false);
    completionSaved.current = false;
    lossSaved.current = false;
  }

  function togglePause() {
    if (completed || lost) {
      return;
    }
    setPaused((current) => !current);
  }

  async function requestHint() {
    if (paused || completed || remainingHints <= 0) {
      return;
    }

    const response = await getHint({ board, solution });
    if (!response.hint) {
      return;
    }

    const nextBoard = cloneBoard(board);
    nextBoard[response.hint.row][response.hint.col] = response.hint.value;
    setHistory((current) => [...current, cloneBoard(board)]);
    setFuture([]);
    setBoard(nextBoard);
    setHintsUsed((current) => current + 1);
    if (soundEnabled) {
      playClick();
    }
  }

  async function checkBoard() {
    const validation = await validateGame({ board, solution });
    if (validation.invalidCells.length > 0 && soundEnabled) {
      playError();
    }
  }

  return (
    <GameContext.Provider
      value={{
        gameId,
        difficulty,
        puzzle,
        solution,
        board,
        selectedCell,
        loading,
        paused,
        completed,
        lost,
        autoCheck,
        timeElapsed,
        mistakes,
        hintsUsed,
        invalidCells: analysis.invalidCells,
        completionPercent: analysis.progress,
        celebration,
        soundEnabled,
        maxHints,
        maxMistakes: MAX_MISTAKES,
        remainingHints,
        lastSavedOutcomeTick,
        progressByDifficulty: progress,
        unlockTargets: UNLOCK_TARGETS,
        unlockedDifficulties,
        isDifficultyUnlocked,
        startNewGame,
        selectCell,
        setCellValue,
        clearCell,
        undo,
        redo,
        restartPuzzle,
        togglePause,
        toggleAutoCheck: () => setAutoCheck((current) => !current),
        toggleSound,
        requestHint,
        checkBoard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return context;
}
