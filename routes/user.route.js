import expres from "express";
import {
  getUserByEmail,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
const userRouter = expres.Router();

userRouter.get("/get-by-id/:id", getUserById);
userRouter.get("/get-by-email/:email", getUserByEmail);
userRouter.put("/update/:id", updateUser);

export default userRouter;
