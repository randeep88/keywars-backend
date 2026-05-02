import express from "express";
import {
  getGlobalLeaderboard,
  getHomeStats,
} from "../controllers/leaderboard.controller.js";
const leaderboardRouter = express.Router();

import { checkAuth } from "../middlewares/auth.middleware.js";

leaderboardRouter.get("/global", checkAuth, getGlobalLeaderboard);
leaderboardRouter.get("/home-stats", getHomeStats);

export default leaderboardRouter;
