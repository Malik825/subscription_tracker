import { Router } from "express";
import {
  getAllUsers,
  getUser,
  getUserPreferences,
  updateUserPreference,
  upgradeToPro,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const userRouter = Router();

// STATIC ROUTES FIRST
userRouter.get("/preferences", authMiddleware, getUserPreferences);
userRouter.patch("/preferences", authMiddleware, updateUserPreference);
userRouter.put("/upgrade", authMiddleware, upgradeToPro);

// THEN DYNAMIC ROUTES
userRouter.get("/", getAllUsers);
userRouter.get("/:id", authMiddleware, getUser);

userRouter.post("/:id", (req, res) => {
  res.send({ message: "User updated" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ message: "User deleted" });
});

export default userRouter;
