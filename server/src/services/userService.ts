import { getUserById } from '../data/memoryStore.js';
import { getHistory, getLeaderboard } from './gameService.js';

export function getDashboard(userId: string) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const games = getHistory(userId);
  const completedGames = games.filter((game) => game.completed);
  const bestTime = completedGames.length > 0 ? Math.min(...completedGames.map((game) => game.timeElapsed)) : 0;
  const totalTime = completedGames.reduce((sum, game) => sum + game.timeElapsed, 0);
  const totalMistakes = games.reduce((sum, game) => sum + game.mistakes, 0);
  const totalHints = games.reduce((sum, game) => sum + game.hintsUsed, 0);
  const totalScore = completedGames.reduce((sum, game) => sum + game.score, 0);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    stats: {
      totalGames: games.length,
      wins: completedGames.length,
      winRate: games.length ? Math.round((completedGames.length / games.length) * 100) : 0,
      bestTime,
      averageTime: completedGames.length ? Math.round(totalTime / completedGames.length) : 0,
      totalMistakes,
      totalHints,
      totalScore,
    },
    recentGames: games.slice(0, 5),
    leaderboard: getLeaderboard().slice(0, 10),
  };
}
