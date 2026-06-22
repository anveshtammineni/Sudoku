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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    boardRef.current?.focus();
  }, [board]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let rotateX = 0;
    let rotateY = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? 400;
      height = rect?.height ?? 400;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - width / 2;
      const mouseY = event.clientY - rect.top - height / 2;
      targetRotateY = (mouseX / (width / 2)) * 0.35;
      targetRotateX = -(mouseY / (height / 2)) * 0.35;
    };

    const handleMouseLeave = () => {
      targetRotateX = 0;
      targetRotateY = 0;
    };

    const parent = canvas.parentElement;
    parent?.addEventListener('mousemove', handleMouseMove);
    parent?.addEventListener('mouseleave', handleMouseLeave);

    const vertices = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const cubes = [
      { x: -110, y: -90, z: 20, size: 38, rx: 0.1, ry: 0.2, rz: 0.3, speedX: 0.004, speedY: 0.006, speedZ: 0.002 },
      { x: 120, y: 100, z: -60, size: 45, rx: 0.4, ry: 0.1, rz: 0.2, speedX: 0.002, speedY: 0.003, speedZ: 0.004 },
      { x: 90, y: -110, z: 60, size: 28, rx: 0.2, ry: 0.3, rz: 0.1, speedX: 0.005, speedY: 0.002, speedZ: 0.003 },
      { x: -130, y: 110, z: -10, size: 32, rx: 0.3, ry: 0.2, rz: 0.4, speedX: 0.003, speedY: 0.004, speedZ: 0.003 },
    ];

    const particles: { x: number; y: number; z: number; speedZ: number }[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 360,
        y: (Math.random() - 0.5) * 360,
        z: (Math.random() - 0.5) * 300,
        speedZ: 0.15 + Math.random() * 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      rotateX += (targetRotateX - rotateX) * 0.06;
      rotateY += (targetRotateY - rotateY) * 0.06;

      const isLightMode = document.documentElement.dataset.theme === 'light';
      const lineColor = isLightMode 
        ? 'rgba(6, 182, 212, 0.08)' 
        : 'rgba(56, 189, 248, 0.13)';
      const nodeColor = isLightMode
        ? 'rgba(16, 185, 129, 0.12)' 
        : 'rgba(52, 211, 153, 0.18)';
      const particleColor = isLightMode
        ? 'rgba(6, 182, 212, 0.20)'
        : 'rgba(56, 189, 248, 0.28)';

      ctx.fillStyle = particleColor;
      particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z < -150) p.z = 150;

        const cosX = Math.cos(rotateX * 0.5);
        const sinX = Math.sin(rotateX * 0.5);
        const cosY = Math.cos(rotateY * 0.5);
        const sinY = Math.sin(rotateY * 0.5);

        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY - z1 * sinY;
        let z2 = p.x * sinY + z1 * cosY;

        const fov = 400;
        const scale = fov / (fov + z2);
        const px = width / 2 + x2 * scale;
        const py = height / 2 + y1 * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      cubes.forEach((cube) => {
        cube.rx += cube.speedX;
        cube.ry += cube.speedY;
        cube.rz += cube.speedZ;

        const finalRx = cube.rx + rotateX;
        const finalRy = cube.ry + rotateY;
        const finalRz = cube.rz;

        const projected: { x: number; y: number }[] = [];

        vertices.forEach((v) => {
          let x = v.x * cube.size;
          let y = v.y * cube.size;
          let z = v.z * cube.size;

          const cosX = Math.cos(finalRx);
          const sinX = Math.sin(finalRx);
          let y1 = y * cosX - z * sinX;
          let z1 = y * sinX + z * cosX;

          const cosY = Math.cos(finalRy);
          const sinY = Math.sin(finalRy);
          let x2 = x * cosY - z1 * sinY;
          let z2 = x * sinY + z1 * cosY;

          const cosZ = Math.cos(finalRz);
          const sinZ = Math.sin(finalRz);
          let x3 = x2 * cosZ - y1 * sinZ;
          let y3 = x2 * sinZ + y1 * cosZ;

          const finalX = x3 + cube.x;
          const finalY = y3 + cube.y;
          const finalZ = z2 + cube.z;

          const fov = 400;
          const scale = fov / (fov + finalZ);
          
          projected.push({
            x: width / 2 + finalX * scale,
            y: height / 2 + finalY * scale,
          });
        });

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        edges.forEach((edge) => {
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        ctx.fillStyle = nodeColor;
        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      parent?.removeEventListener('mousemove', handleMouseMove);
      parent?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/60 p-4 shadow-glow backdrop-blur-xl">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
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
        className="relative z-10 grid aspect-square grid-cols-9 overflow-hidden rounded-3xl bg-slate-200/40 dark:bg-slate-950/55 outline-none ring-1 ring-slate-300/80 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400/70"
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
