import { getUserById, getGameSessionsByUser, getLeaderboardEntries } from '../data/store.js';

export async function getDashboard(userId: string) {
  console.log('[STATS DEBUG] Fetching dashboard for userId:', userId);
  const user = await getUserById(userId);
  if (!user) {
    console.error('[STATS DEBUG] User not found for ID:', userId);
    throw new Error('User not found');
  }

  console.log('[STATS DEBUG] User data from database:', {
    id: user.id,
    name: user.name,
    totalGames: user.totalGames,
    totalWins: user.totalWins,
    bestTime: user.bestTime,
    winRate: user.winRate,
  });

  const games = await getGameSessionsByUser(userId);
  console.log('[STATS DEBUG] Total game sessions found:', games.length);
  const leaderboard = await getLeaderboardEntries();

  const completedGames = games.filter((game) => game.completed);
  console.log('[STATS DEBUG] Completed games:', completedGames.length);
  const totalTime = completedGames.reduce((sum, game) => sum + game.timeElapsed, 0);
  const totalMistakes = games.reduce((sum, game) => sum + game.mistakes, 0);
  const totalHints = games.reduce((sum, game) => sum + game.hintsUsed, 0);

  const stats = {
    totalGames: user.totalGames ?? games.length,
    wins: user.totalWins ?? completedGames.length,
    winRate: user.winRate ?? (games.length ? Math.round((completedGames.length / games.length) * 100) : 0),
    bestTime: user.bestTime ?? (completedGames.length > 0 ? Math.min(...completedGames.map((game) => game.timeElapsed)) : 0),
    averageTime: completedGames.length ? Math.round(totalTime / completedGames.length) : 0,
    totalMistakes,
    totalHints,
    totalWins: user.totalWins ?? completedGames.length,
  };

  console.log('[STATS DEBUG] Dashboard stats being returned:', stats);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    stats,
    recentGames: games.slice(0, 5),
    leaderboard: leaderboard.slice(0, 10),
  };
}