import express from "express";
import { getGlobalLeaderboard, getHomeStats } from "../controllers/leaderboard.controller.js";
const leaderboardRouter = express.Router();

leaderboardRouter.get("/global", getGlobalLeaderboard);
leaderboardRouter.get("/home-stats", getHomeStats);

export default leaderboardRouter;
