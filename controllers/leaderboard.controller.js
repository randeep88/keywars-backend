import { prisma } from "../lib/prisma.js";

// GET /api/leaderboard/global
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        photo: true,
        playerWars: {
          select: {
            wpm: true,
            isWinner: true,
          },
        },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalWars = user.playerWars.length;

        const totalWpm = user.playerWars.reduce((sum, war) => sum + war.wpm, 0);

        const avgWpm = totalWars ? Math.round(totalWpm / totalWars) : 0;

        const bestWpm = totalWars
          ? Math.max(...user.playerWars.map((war) => war.wpm))
          : 0;

        const wins = user.playerWars.filter((war) => war.isWinner).length;

        return {
          player: {
            id: user.id,
            name: user.name,
            username: user.username,
            photo: user.photo,
          },
          bestWpm,
          avgWpm,
          wars: totalWars,
          wins,
        };
      })
      .sort((a, b) => {
        // priority: bestWpm > wins > avgWpm
        if (b.bestWpm !== a.bestWpm) {
          return b.bestWpm - a.bestWpm;
        }

        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        return b.avgWpm - a.avgWpm;
      })
      .map((player, index) => ({
        rank: index + 1,
        ...player,
      }));

    return res.status(200).json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHomeStats = async (req, res) => {
  try {
    const allWars = await prisma.playerWar.findMany({
      select: {
        wpm: true,
      },
    });

    const totalPlayers = await prisma.user.count();
    const totalWars = await prisma.war.count();

    const totalWpm = allWars.reduce((sum, item) => sum + item.wpm, 0);

    const avgTopWpm = allWars.length
      ? Math.round(totalWpm / allWars.length)
      : 0;

    const bestWpm = allWars.length
      ? Math.max(...allWars.map((item) => item.wpm))
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPlayers,
        totalWars,
        avgTopWpm,
        bestWpm,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
