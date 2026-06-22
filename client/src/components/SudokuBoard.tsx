import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useGame } from '../context/GameContext';
import { isFixedCell, moveSelection } from '../utils/sudoku';

export function SudokuBoard() {
  const {
    board,
    puzzle,
    solution,
    selectedCell,
    invalidCells,
    paused,
    completed,
    selectCell,
    setCellValue,
  } = useGame();
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    boardRef.current?.focus();
  }, [board]);

  const invalidKeys = new Set(invalidCells.map((cell) => `${cell.row}-${cell.col}`));
  const selectedValue = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!selectedCell || paused || completed) {
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const nextPosition = moveSelection(selectedCell, event.key);
      selectCell(nextPosition.row, nextPosition.col);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
      event.preventDefault();
      setCellValue(0);
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      setCellValue(Number(event.key));
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/60 p-4 shadow-glow backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-700 dark:text-cyan-200/80">Sudoku Grid</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Use keyboard arrows or the keypad to fill the board.</div>
        </div>
        <div className="rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
          {selectedValue ? `Selected ${selectedValue}` : 'No selection'}
        </div>
      </div>

      <div
        ref={boardRef}
        tabIndex={paused || completed ? -1 : 0}
        onKeyDown={handleKeyDown}
        className="grid aspect-square grid-cols-9 overflow-hidden rounded-3xl bg-slate-200/40 dark:bg-slate-950/55 outline-none ring-1 ring-slate-300/80 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400/70"
      >
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const sameRow = selectedCell?.row === rowIndex;
            const sameCol = selectedCell?.col === colIndex;
            const isMatch = selectedValue && value === selectedValue;
            const fixed = isFixedCell(puzzle, rowIndex, colIndex);
            const invalid = invalidKeys.has(`${rowIndex}-${colIndex}`);
            const cellClass = [
              'relative flex items-center justify-center border border-slate-300 dark:border-white/10 text-lg font-semibold font-mono transition duration-200 sm:text-xl md:text-2xl',
              colIndex % 3 === 0 ? 'border-l-2 border-l-slate-500 dark:border-l-white/30' : '',
              rowIndex % 3 === 0 ? 'border-t-2 border-t-slate-500 dark:border-t-white/30' : '',
              colIndex === 8 ? 'border-r-2 border-r-slate-500 dark:border-r-white/30' : '',
              rowIndex === 8 ? 'border-b-2 border-b-slate-500 dark:border-b-white/30' : '',
              isSelected ? 'z-10 bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-50 ring-2 ring-cyan-500 dark:ring-cyan-300' : '',
              !isSelected && sameRow ? 'bg-slate-200/30 dark:bg-white/7 text-slate-800 dark:text-white' : '',
              !isSelected && sameCol ? 'bg-slate-200/30 dark:bg-white/7 text-slate-800 dark:text-white' : '',
              !isSelected && isMatch ? 'bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-100' : '',
              invalid ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-800 dark:text-rose-100' : '',
              fixed ? 'text-slate-800 dark:text-slate-100 font-bold' : 'cursor-pointer text-cyan-600 dark:text-cyan-100 hover:bg-slate-200/50 dark:hover:bg-white/8',
              !fixed && !value ? 'text-slate-400 dark:text-slate-500' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                type="button"
                key={`${rowIndex}-${colIndex}`}
                onClick={() => selectCell(rowIndex, colIndex)}
                className={cellClass}
                aria-label={`Row ${rowIndex + 1} Column ${colIndex + 1}`}
              >
                <span className="absolute inset-0 opacity-0 transition duration-200 hover:opacity-100 hover:bg-slate-300/20 dark:hover:bg-white/5" />
                <span className="relative z-10">{value || ''}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
