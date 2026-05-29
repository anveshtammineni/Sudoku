import type { Board } from '../types';

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function isFixedCell(puzzle: Board, row: number, col: number): boolean {
  return Boolean(puzzle[row]?.[col]);
}

function findDuplicateCells(board: Board): Set<string> {
  const duplicates = new Set<string>();
  const size = 9;
  const box = 3;

  for (let row = 0; row < size; row += 1) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < size; col += 1) {
      const value = board[row][col];
      if (!value) continue;
      const positions = seen.get(value) ?? [];
      positions.push(col);
      seen.set(value, positions);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) positions.forEach((col) => duplicates.add(`${row}-${col}`));
    }
  }

  for (let col = 0; col < size; col += 1) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < size; row += 1) {
      const value = board[row][col];
      if (!value) continue;
      const positions = seen.get(value) ?? [];
      positions.push(row);
      seen.set(value, positions);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) positions.forEach((row) => duplicates.add(`${row}-${col}`));
    }
  }

  for (let boxRow = 0; boxRow < size; boxRow += box) {
    for (let boxCol = 0; boxCol < size; boxCol += box) {
      const seen = new Map<number, Array<[number, number]>>();
      for (let rowOffset = 0; rowOffset < box; rowOffset += 1) {
        for (let colOffset = 0; colOffset < box; colOffset += 1) {
          const row = boxRow + rowOffset;
          const col = boxCol + colOffset;
          const value = board[row][col];
          if (!value) continue;
          const positions = seen.get(value) ?? [];
          positions.push([row, col]);
          seen.set(value, positions);
        }
      }
      for (const positions of seen.values()) {
        if (positions.length > 1) positions.forEach(([row, col]) => duplicates.add(`${row}-${col}`));
      }
    }
  }

  return duplicates;
}

export function analyzeBoard(board: Board, solution: Board) {
  const invalidCells: Array<{ row: number; col: number; value: number }> = [];
  const duplicates = findDuplicateCells(board);
  let isComplete = true;
  let filled = 0;

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = board[row][col];
      if (!value) {
        isComplete = false;
        continue;
      }
      filled += 1;
      if (value !== solution[row][col] || duplicates.has(`${row}-${col}`)) {
        invalidCells.push({ row, col, value });
      }
    }
  }

  return {
    invalidCells,
    isComplete,
    isSolved: isComplete && invalidCells.length === 0,
    filled,
    progress: Math.round((filled / 81) * 100),
  };
}

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

export function findFirstEditableCell(puzzle: Board) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (!puzzle[row][col]) {
        return { row, col };
      }
    }
  }
  return { row: 0, col: 0 };
}

export function moveSelection(position: { row: number; col: number }, key: string) {
  const deltas: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };
  const delta = deltas[key];
  if (!delta) {
    return position;
  }

  const [rowDelta, colDelta] = delta;
  return {
    row: (position.row + rowDelta + 9) % 9,
    col: (position.col + colDelta + 9) % 9,
  };
}
