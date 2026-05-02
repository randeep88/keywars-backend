import expres from "express";
import {
  getWarByRoomId,
  getRecentWars,
} from "../controllers/war.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";

const warRouter = expres.Router();

warRouter.get("/get-by-roomId/:roomId", checkAuth, getWarByRoomId);
warRouter.get("/recent", checkAuth, getRecentWars);

export default warRouter;
