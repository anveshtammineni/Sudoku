import type { Board, Difficulty } from '../types/domain.js';

const SIZE = 9;
const BOX = 3;

const difficultyClues: Record<Difficulty, number> = {
  easy: 40,
  medium: 34,
  hard: 28,
  expert: 24,
};

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
}

function isSafe(board: Board, row: number, col: number, value: number): boolean {
  for (let index = 0; index < SIZE; index += 1) {
    if (board[row]![index] === value || board[index]![col] === value) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX) * BOX;
  const startCol = Math.floor(col / BOX) * BOX;
  for (let r = 0; r < BOX; r += 1) {
    for (let c = 0; c < BOX; c += 1) {
      if (board[startRow + r]![startCol + c] === value) {
        return false;
      }
    }
  }

  return true;
}

function findEmptyCell(board: Board): [number, number] | null {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row]![col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

function solveInPlace(board: Board): boolean {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;
  for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isSafe(board, row, col, value)) {
      board[row]![col] = value;
      if (solveInPlace(board)) {
        return true;
      }
      board[row]![col] = 0;
    }
  }

  return false;
}

function countSolutions(board: Board, limit = 2): number {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) {
    return 1;
  }

  const [row, col] = emptyCell;
  let solutions = 0;

  for (let value = 1; value <= 9; value += 1) {
    if (!isSafe(board, row, col, value)) {
      continue;
    }

    board[row]![col] = value;
    solutions += countSolutions(board, limit);
    board[row]![col] = 0;

    if (solutions >= limit) {
      return solutions;
    }
  }

  return solutions;
}

function buildDuplicateCellSet(board: Board): Set<string> {
  const duplicates = new Set<string>();

  for (let row = 0; row < SIZE; row += 1) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row]![col];
      if (!value) {
        continue;
      }
      const positions = seen.get(value) ?? [];
      positions.push(col);
      seen.set(value, positions);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        positions.forEach((col) => duplicates.add(`${row}-${col}`));
      }
    }
  }

  for (let col = 0; col < SIZE; col += 1) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < SIZE; row += 1) {
      const value = board[row]![col];
      if (!value) {
        continue;
      }
      const positions = seen.get(value) ?? [];
      positions.push(row);
      seen.set(value, positions);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        positions.forEach((row) => duplicates.add(`${row}-${col}`));
      }
    }
  }

  for (let boxRow = 0; boxRow < SIZE; boxRow += BOX) {
    for (let boxCol = 0; boxCol < SIZE; boxCol += BOX) {
      const seen = new Map<number, Array<[number, number]>>();
      for (let rowOffset = 0; rowOffset < BOX; rowOffset += 1) {
        for (let colOffset = 0; colOffset < BOX; colOffset += 1) {
          const row = boxRow + rowOffset;
          const col = boxCol + colOffset;
          const value = board[row]![col];
          if (!value) {
            continue;
          }
          const positions = seen.get(value) ?? [];
          positions.push([row, col]);
          seen.set(value, positions);
        }
      }
      for (const positions of seen.values()) {
        if (positions.length > 1) {
          positions.forEach(([row, col]) => duplicates.add(`${row}-${col}`));
        }
      }
    }
  }

  return duplicates;
}

function removeCellsForDifficulty(board: Board, difficulty: Difficulty): { puzzle: Board; clues: number } {
  const targetClues = difficultyClues[difficulty];
  const puzzle = cloneBoard(board);
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => [Math.floor(index / SIZE), index % SIZE] as [number, number])
  );

  let filled = SIZE * SIZE;
  for (const [row, col] of positions) {
    if (filled <= targetClues) {
      break;
    }

    const current = puzzle[row]![col]!;
    puzzle[row]![col] = 0;
    const attempts = cloneBoard(puzzle);
    if (countSolutions(attempts, 2) !== 1) {
      puzzle[row]![col] = current;
      continue;
    }

    filled -= 1;
  }

  return { puzzle, clues: filled };
}

export function generateSolvedBoard(): Board {
  const board = createEmptyBoard();
  solveInPlace(board);
  return board;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board; clues: number } {
  const solution = generateSolvedBoard();
  const { puzzle, clues } = removeCellsForDifficulty(solution, difficulty);
  return { puzzle, solution, clues };
}

export function solveBoard(board: Board): Board | null {
  const copy = cloneBoard(board);
  if (!solveInPlace(copy)) {
    return null;
  }
  return copy;
}

export function validateBoard(board: Board, solution?: Board): {
  isComplete: boolean;
  isSolved: boolean;
  invalidCells: Array<{ row: number; col: number; value: number }>;
} {
  const invalidCells: Array<{ row: number; col: number; value: number }> = [];
  const duplicates = buildDuplicateCellSet(board);
  let isComplete = true;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row]![col];
      if (!value) {
        isComplete = false;
        continue;
      }

      const solutionValue = solution?.[row]?.[col];
      const isMismatch = typeof solutionValue === 'number' && solutionValue !== value;
      if (isMismatch || duplicates.has(`${row}-${col}`)) {
        invalidCells.push({ row, col, value });
      }
    }
  }

  return {
    isComplete,
    isSolved: isComplete && invalidCells.length === 0,
    invalidCells,
  };
}

export function createHint(board: Board, solution: Board): { row: number; col: number; value: number } | null {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row]![col] !== solution[row]![col]) {
        return { row, col, value: solution[row]![col]! };
      }
    }
  }
  return null;
}

export function normalizeBoard(board: Board): Board {
  return board.map((row) => row.map((value) => (Number.isInteger(value) && value >= 1 && value <= 9 ? value : 0)));
}
