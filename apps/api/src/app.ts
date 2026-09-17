import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config.js';
import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import rulesRoutes from './routes/rules.routes.js';
import auditRoutes from './routes/audit.routes.js';
import { router as drivesRoutes } from './routes/drives.routes.js';
import { errorHandler } from './middleware/error.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.resolve(__dirname, '../../web/dist');

export const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any requesting origin dynamically (Render, Vercel, Netlify, custom domain, or localhost)
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Prevent caching on all API endpoints so updates and additions are immediately visible
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Smart Candidate Screening System API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/drives', drivesRoutes);

// Production Static Serving for Single-Service Cloud Deployments (Render, Railway, Heroku, Docker)
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.use(errorHandler);


