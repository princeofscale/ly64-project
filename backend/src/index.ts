import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import studentsRoutes from './routes/students';
import diagnosticRoutes from './routes/diagnostic';
import testsRoutes from './routes/tests';
import adminRoutes from './routes/admin';
import testLoaderService from './services/testLoaderService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port in development
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Увеличен лимит для загрузки base64 изображений
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Lyceum 64 API is running' });
});

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/students', studentsRoutes);

app.use('/api/diagnostic', diagnosticRoutes);

app.use('/api/tests', testsRoutes);

app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api`);

  // Initialize test loader - automatically loads tests from sdamgia_api if database is empty
  await testLoaderService.initialize();
});

export default app;
