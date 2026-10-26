import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { tasksRouter } from './routes/tasks.js';
import { errorHandler, notFound } from './middleware/errors.js';

export const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use(notFound);
app.use(errorHandler);
