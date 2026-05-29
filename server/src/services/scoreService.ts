import type { Difficulty } from '../types/domain.js';

const difficultyMultiplier: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.25,
  hard: 1.6,
  expert: 2,
};

export function calculateScore(params: {
  difficulty: Difficulty;
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
}): number {
  const { difficulty, timeElapsed, mistakes, hintsUsed } = params;
  const baseScore = 1000 * difficultyMultiplier[difficulty];
  const timePenalty = Math.floor(timeElapsed / 5);
  const mistakePenalty = mistakes * 20;
  const hintPenalty = hintsUsed * 35;
  return Math.max(100, Math.round(baseScore - timePenalty - mistakePenalty - hintPenalty));
}
