import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getHint, getNewGame, saveGame, validateGame } from '../api/gameApi';
import { useSound } from '../hooks/useSound';
import type { Board, Difficulty, GameSession } from '../types';
import { analyzeBoard, cloneBoard, findFirstEditableCell, isFixedCell } from '../utils/sudoku';

type SelectedCell = { row: number; col: number } | null;

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
  autoCheck: boolean;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  invalidCells: Array<{ row: number; col: number; value: number }>;
  completionPercent: number;
  celebration: boolean;
  soundEnabled: boolean;
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
  const [autoCheck, setAutoCheck] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<Board[]>([]);
  const [future, setFuture] = useState<Board[]>([]);
  const [celebration, setCelebration] = useState(false);
  const completionSaved = useRef(false);
  const { enabled: soundEnabled, toggleSound, playClick, playError, playSuccess } = useSound();

  const analysis = useMemo(() => analyzeBoard(board, solution), [board, solution]);

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
    if (!analysis.isSolved || completed) {
      return;
    }

    setCompleted(true);
    setPaused(true);
    setCelebration(true);
    playSuccess();

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
      }).catch(() => undefined);
    }

    const timeout = window.setTimeout(() => setCelebration(false), 4200);
    return () => window.clearTimeout(timeout);
  }, [analysis.isSolved, board, completed, difficulty, gameId, hintsUsed, mistakes, paused, puzzle, solution, timeElapsed, playSuccess]);

  async function startNewGame(nextDifficulty: Difficulty) {
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
      setAutoCheck(true);
      setTimeElapsed(0);
      setMistakes(0);
      setHintsUsed(0);
      setHistory([]);
      setFuture([]);
      setCelebration(false);
      completionSaved.current = false;
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
    if (!selectedCell || paused || completed) {
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
      setMistakes((current) => current + 1);
      if (soundEnabled) {
        playError();
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
    setTimeElapsed(0);
    setMistakes(0);
    setHintsUsed(0);
    setHistory([]);
    setFuture([]);
    setCelebration(false);
    completionSaved.current = false;
  }

  function togglePause() {
    if (completed) {
      return;
    }
    setPaused((current) => !current);
  }

  async function requestHint() {
    if (paused || completed) {
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
        autoCheck,
        timeElapsed,
        mistakes,
        hintsUsed,
        invalidCells: analysis.invalidCells,
        completionPercent: analysis.progress,
        celebration,
        soundEnabled,
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
