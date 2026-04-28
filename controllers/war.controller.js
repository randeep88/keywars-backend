import { prisma } from "../lib/prisma.js";

export const getWarByRoomId = async (req, res) => {
  const { roomId } = req.params;

  console.log(roomId, "in war");

  try {
    const war = await prisma.war.findFirst({
      where: {
        roomId,
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    console.log(war, "in war");

    if (!war) {
      return res.status(404).json({ success: false, message: "War not found" });
    }

    res.json({ success: true, data: war });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentWars = async (req, res) => {
  try {
    const wars = await prisma.war.findMany({
      take: 3,
      orderBy: {
        startedAt: "desc",
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                photo: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: wars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
