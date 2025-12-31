import express from 'express';
import authRouter from './routes/auth.routes.js';
import { PORT, NODE_ENV } from './config/env.js';
import userRouter from './routes/user.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import connectDB from './database/mongodb.js';
import { errorHandler } from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import workflowRouter from './routes/workflow.route.js';
import paymentRouter from './routes/payment.route.js';
import cors from 'cors';
import { FRONTEND_URL } from './config/env.js';

// Initialize Express app
const app = express();
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// global middlewares
const allowedOrigins = [
  'https://subscription-tracker-lovat.vercel.app',
  'http://localhost:5173',
  FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
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
app.use('/api/v1/workflows', workflowRouter);
app.use('/api/v1/payments', paymentRouter);

// Error handling middleware
app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

export default app;