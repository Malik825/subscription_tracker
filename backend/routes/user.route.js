import { Router } from 'express';
import { getAllUsers, getUser, upgradeToPro } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", authMiddleware, getUser);
userRouter.put("/upgrade", authMiddleware, upgradeToPro);

userRouter.post("/:id", (req, res) => {
  res.send({ message: "User updated" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ message: "User deleted" });
});

export default userRouter;