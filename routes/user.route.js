import expres from "express";
import {
  getUserByEmail,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
const userRouter = expres.Router();
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/get-by-id/:id", getUserById);
userRouter.get("/get-by-email/:email", getUserByEmail);
userRouter.put("/update-photo/:id", upload.single("photo"), updateUser);

export default userRouter;
