import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import userRoutes from './routes/user';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware для OAuth state
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'lyceum64-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 10, // 10 минут
    },
  })
);

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Lyceum 64 API is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// OAuth routes
app.use('/api/oauth', oauthRoutes);

// User routes
app.use('/api/users', userRoutes);

// TODO: Add more routes
// app.use('/api/tests', testRoutes);
// app.use('/api/questions', questionRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation: http://localhost:${PORT}/api`);
});

export default app;
