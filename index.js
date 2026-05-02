import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import leaderboardRouter from "./routes/leaderboard.route.js";
import { redis } from "./lib/redis.js";
import { prisma } from "./lib/prisma.js";
import warRouter from "./routes/war.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["https://keystroq.vercel.app", "http://localhost:3000"],
    // origin: "*",
  }),
);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["https://keystroq.vercel.app", "http://localhost:3000"],
    // origin: "*",
  },
});

app.use(express.json());
app.use(cookieParser());

const connectedUsers = new Map();
const roomHosts = new Map();

// connection
io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("register", (userId) => {
    connectedUsers.set(socket.id, userId);
  });

  // join room
  socket.on("join-room", ({ userId, roomId }) => {
    socket.join(roomId);

    console.log(`${userId} joined room: ${roomId} ✅`);

    if (!roomHosts.has(roomId)) {
      roomHosts.set(roomId, userId);
    }

    const room = io.sockets.adapter.rooms.get(roomId);
    const usersInRoom = room
      ? [...room].map((socketId) => connectedUsers.get(socketId))
      : [];

    io.to(roomId).emit("notify:room", {
      userId,
      roomId,
      action: "joined",
      users: usersInRoom,
      host: roomHosts.get(roomId),
    });
  });

  // leave room
  socket.on("leave-room", ({ userId, roomId }) => {
    socket.leave(roomId);
    console.log(`${userId} left room: ${roomId}`);
    io.to(roomId).emit("notify:room", { userId, roomId, action: "left" });
    socket.emit("notify:room", { userId, roomId, action: "left" });
  });

  socket.on("ready", (data) => {
    io.to(data.roomId).emit("notify:ready", {
      userId: data.userId,
      roomId: data.roomId,
      action: "ready",
    });
  });

  // start war
  socket.on("war:start", async (data) => {
    io.to(data.roomId).emit("notify:war", {
      userId: data.userId,
      roomId: data.roomId,
      action: "start",
      data: data.data,
    });

    await redis.hset(
      `war:${data.roomId}`,
      "roomId",
      data.roomId,
      "startedAt",
      Date.now().toString(),
      "endedAt",
      "",
      "status",
      "started",
      "host",
      data.userId,
      "started",
      "true",
      "passage",
      data.passage,
    );

    await redis.sadd(`war:${data.roomId}:players`, ...data.players);
  });

  socket.on("set-passage", async (data) => {
    await redis.hset(`war:${data.roomId}`, "passage", data.passage);
    const arena = await redis.hgetall(`war:${data.roomId}`);
    const players = await redis.smembers(`war:${data.roomId}:players`);

    io.to(data.roomId).emit("receive:war-data", {
      arena,
      players,
    });

    io.to(data.roomId).emit("passage:set", {
      passage: data.passage,
      roomId: data.roomId,
      isBackspaceDisabled: data.isBackspaceDisabled,
      wordCount: data.wordCount,
    });
  });

  socket.on("set-backspace", async (data) => {
    io.to(data.roomId).emit("backspace:set", {
      isBackspaceDisabled: data.isBackspaceDisabled,
    });
  });

  //get arena data
  socket.on("get-war-data", async (roomId) => {
    const arena = await redis.hgetall(`war:${roomId}`);
    const players = await redis.smembers(`war:${roomId}:players`);

    io.to(roomId).emit("receive:war-data", { arena, players });
  });

  // sending live war data
  socket.on("live-war-data", async (data) => {
    io.to(data.roomId).emit("receive:live-war-data", data);
  });

  // finish war
  socket.on("war:finish", async (data) => {
    await redis.hset(
      `war:${data.roomId}:finish:${data.userId}`,
      "userId",
      data.userId,
      "finishedAt",
      data.finishedAt.toString(),
      "wpm",
      data.wpm.toString(),
      "accuracy",
      data.accuracy.toString(),
      "error",
      data.error.toString(),
      "progress",
      data.progress.toString(),
    );

    const arena = await redis.hgetall(`war:${data.roomId}`);
    const players = await redis.smembers(`war:${data.roomId}:players`);

    const finishDataAll = await Promise.all(
      players.map((userId) =>
        redis.hgetall(`war:${data.roomId}:finish:${userId}`),
      ),
    );

    const allFinished = finishDataAll.every((d) => d && d.finishedAt);

    if (!allFinished) return;

    const war = await prisma.war.create({
      data: {
        roomId: data.roomId,
        passage: arena.passage,
        startedAt: arena.startedAt,
        status: "finished",
      },
    });

    const getScore = (p) => {
      const accuracy = Number(p.accuracy);
      const wpm = Number(p.wpm);
      const errors = Number(p.error);
      const timeTaken = Number(p.finishedAt) - Number(arena.startedAt);
      const effectiveWpm = wpm * (accuracy / 100);
      return { effectiveWpm, accuracy, errors, timeTaken };
    };

    const rankedPlayers = [...finishDataAll]
      .filter((d) => d && d.userId)
      .sort((a, b) => {
        const sa = getScore(a);
        const sb = getScore(b);

        // 1. Effective WPM (wpm * accuracy) — main criteria
        if (sb.effectiveWpm !== sa.effectiveWpm)
          return sb.effectiveWpm - sa.effectiveWpm;

        // 2. Raw accuracy
        if (sb.accuracy !== sa.accuracy) return sb.accuracy - sa.accuracy;

        // 3. Errors (kam better)
        if (sa.errors !== sb.errors) return sa.errors - sb.errors;

        // 4. Time taken (kam better)
        return sa.timeTaken - sb.timeTaken;
      })
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        isWinner: index === 0,
      }));

    const winner = rankedPlayers[0];

    await prisma.playerWar.createMany({
      data: rankedPlayers.map((p) => ({
        warId: war.id,
        userId: p.userId,
        roomId: data.roomId,
        wpm: parseInt(p.wpm),
        accuracy: parseInt(p.accuracy),
        error: parseInt(p.error),
        progress: parseInt(p.progress),
        finishedAt: p.finishedAt,
        rank: p.rank,
        isWinner: p.isWinner,
      })),
    });

    io.to(data.roomId).emit("notify:war", {
      action: "finish",
      winner: winner.userId,
      players: finishDataAll,
    });

    await redis.del(`war:${data.roomId}`);
    await redis.del(`war:${data.roomId}:players`);
    await Promise.all(
      players.map((userId) => redis.del(`war:${data.roomId}:finish:${userId}`)),
    );
  });

  socket.on("disconnect", () => {
    console.log("user disconnected: ", socket.id);
    connectedUsers.delete(socket.id);
  });
});

app.get("/", (_req, res) => {
  res.send("all ok");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/war", warRouter);
app.use("/api/leaderboard", leaderboardRouter);

httpServer.listen(5000, () => {
  console.log("Server is running on port 5000");
});
