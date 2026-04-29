import express from "express";
import {
  getGlobalLeaderboard,
  getHomeStats,
} from "../controllers/leaderboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const leaderboardRouter = express.Router();

leaderboardRouter.get("/global", authMiddleware, getGlobalLeaderboard);
leaderboardRouter.get("/home-stats", authMiddleware, getHomeStats);

export default leaderboardRouter;
