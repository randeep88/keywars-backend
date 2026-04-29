import expres from "express";
import {
  getUserByEmail,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const userRouter = expres.Router();
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/get-by-id/:id", authMiddleware, getUserById);
userRouter.get("/get-by-email/:email", authMiddleware, getUserByEmail);
userRouter.put(
  "/update-photo/:id",
  authMiddleware,
  upload.single("photo"),
  updateUser,
);

export default userRouter;
