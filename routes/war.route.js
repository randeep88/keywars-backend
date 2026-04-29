import expres from "express";
import {
  getWarByRoomId,
  getRecentWars,
} from "../controllers/war.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const warRouter = expres.Router();

warRouter.get("/get-by-roomId/:roomId", authMiddleware, getWarByRoomId);
warRouter.get("/recent", authMiddleware, getRecentWars);

export default warRouter;
