import Router from 'express'
import { registerUser, loginUser, verifyEmail, logoutUser, getCurrentUser, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post('/signup', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/logout', logoutUser);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/me', authMiddleware, getCurrentUser);

export default authRouter;
