import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import { redis } from "./lib/redis.js";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const connectedUsers = new Map();
const roomHosts = new Map();

// connection
io.on("connection", (socket) => {
  console.log("user connected: ", socket.id);

  socket.on("register", (userId) => {
    connectedUsers.set(socket.id, userId);
    console.log(`${userId} registered to socketId: ${socket.id}`);
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
    console.log(`${data.userId} started war in room: ${data.roomId}`);

    io.to(data.roomId).emit("notify:war", {
      userId: data.userId,
      roomId: data.roomId,
      action: "start",
      data: data.data,
    });

    await redis.hset(
      `arena:${data.roomId}`,
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

    await redis.sadd(`arena:${data.roomId}:players`, ...data.players);
  });

  //get arena data
  socket.on("get-war-data", async (roomId) => {
    const arena = await redis.hgetall(`arena:${roomId}`);
    const players = await redis.smembers(`arena:${roomId}:players`);

    io.to(roomId).emit("receive:war-data", { arena, players });
  });

  // sending live war data
  socket.on("live-war-data", async (data) => {
    console.log("live war data received", data);
    io.to(data.roomId).emit("receive:live-war-data", data);
  });

  // finish war
  socket.on("war:finish", (data) => {
    console.log(`${data.userId} finished war in room: ${data.roomId}`);
    io.to(data.roomId).emit("notify:war", {
      userId: data.userId,
      roomId: data.roomId,
      action: "finish",
      data: data.data,
    });

    // TODO: delete data from redis
    console.log("data deleted from redis");
    console.log("data pushed to database");
  });

  // disconnect
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

httpServer.listen(5000, () => {
  console.log("Server is running on port 5000");
});
