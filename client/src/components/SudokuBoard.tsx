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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur-xl dark:bg-slate-950/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Sudoku Grid</div>
          <div className="text-sm text-slate-300">Use keyboard arrows or the keypad to fill the board.</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          {selectedValue ? `Selected ${selectedValue}` : 'No selection'}
        </div>
      </div>

      <div
        ref={boardRef}
        tabIndex={paused || completed ? -1 : 0}
        onKeyDown={handleKeyDown}
        className="grid aspect-square grid-cols-9 overflow-hidden rounded-3xl bg-slate-950/55 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400/70"
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
              'relative flex items-center justify-center border border-white/6 text-lg font-semibold font-mono transition duration-200 sm:text-xl md:text-2xl',
              colIndex % 3 === 0 ? 'border-l-2 border-l-white/18' : '',
              rowIndex % 3 === 0 ? 'border-t-2 border-t-white/18' : '',
              colIndex === 8 ? 'border-r-2 border-r-white/18' : '',
              rowIndex === 8 ? 'border-b-2 border-b-white/18' : '',
              isSelected ? 'z-10 bg-cyan-400/20 text-cyan-50 ring-2 ring-cyan-300' : '',
              !isSelected && sameRow ? 'bg-white/7 text-white' : '',
              !isSelected && sameCol ? 'bg-white/7 text-white' : '',
              !isSelected && isMatch ? 'bg-emerald-400/15 text-emerald-100' : '',
              invalid ? 'bg-rose-500/20 text-rose-100' : '',
              fixed ? 'text-slate-100' : 'cursor-pointer text-cyan-100 hover:bg-white/8',
              !fixed && !value ? 'text-slate-500' : '',
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
                <span className="absolute inset-0 opacity-0 transition duration-200 hover:opacity-100 hover:bg-white/5" />
                <span className="relative z-10">{value || ''}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
