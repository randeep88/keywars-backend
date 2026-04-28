import expres from "express";
import { getWarByRoomId, getRecentWars } from "../controllers/war.controller.js";
const warRouter = expres.Router();

warRouter.get("/get-by-roomId/:roomId", getWarByRoomId);
warRouter.get("/recent", getRecentWars);

export default warRouter;
