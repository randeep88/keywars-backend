import express from "express";
import {
  getUserByEmail,
  getUserById,
  syncUser,
  updateImageUrl,
} from "../controllers/user.controller.js";
const userRouter = express.Router();
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
import { checkAuth } from "../middlewares/auth.middleware.js";

userRouter.get("/get-by-id/:id", checkAuth, getUserById);
userRouter.get("/get-by-email/:email", checkAuth, getUserByEmail);
userRouter.put("/sync", checkAuth, syncUser);
userRouter.put(
  "/update-photo/:id",
  checkAuth,
  upload.single("photo"),
  updateImageUrl,
);

export default userRouter;
