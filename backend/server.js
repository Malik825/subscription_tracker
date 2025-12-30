import express from 'express';
import authRouter from './routes/auth.routes.js';
import { PORT } from './config/env.js';
import userRouter from './routes/user.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import connectDB from './database/mongodb.js';
import { errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import workflowRouter from './routes/workflow.route.js';

// Initialize Express app
const app = express();

// global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(arcjetMiddleware);

 
// Define routes

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter)

// Error handling middleware
app.use(errorHandler)

app.listen(PORT,  async() => {
  console.log(`Server is running on port ${PORT}`);
  await  connectDB();
});

export default app;