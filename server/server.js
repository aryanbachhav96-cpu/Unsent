import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import adminRoutes from './routes/admin.js';
import { seedSampleData } from './seed.js';

dotenv.config();

if (process.env.NODE_ENV === 'production') {
  const requiredSecrets = ['JWT_SECRET', 'IP_SALT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_HANDLE'];
  const missingSecrets = requiredSecrets.filter((key) => !process.env[key]?.trim());
  const invalidValues = requiredSecrets.filter((key) => {
    const value = process.env[key]?.trim() || '';
    if (['JWT_SECRET', 'IP_SALT_SECRET'].includes(key)) {
      return value.length < 32 || /^replace-with-/i.test(value) || /change_in_production|default_salt/i.test(value);
    }
    return /^replace-with-/i.test(value) ||
      (key === 'ADMIN_EMAIL' && value.endsWith('.internal')) ||
      (key === 'ADMIN_PASSWORD' && value.length < 20);
  });

  if (
    process.env.JWT_SECRET &&
    process.env.IP_SALT_SECRET &&
    process.env.JWT_SECRET === process.env.IP_SALT_SECRET
  ) {
    invalidValues.push('JWT_SECRET and IP_SALT_SECRET must be different');
  }

  if (missingSecrets.length || invalidValues.length) {
    throw new Error(
      `Invalid production configuration. Missing: ${missingSecrets.join(', ') || 'none'}. ` +
      `Invalid values: ${invalidValues.join(', ') || 'none'}.`
    );
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

// Global Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please take a quiet moment and try again later.' },
});
app.use('/api', generalLimiter);

// Specific Write/Post Rate Limiter
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 posts/comments/reactions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Posting too fast. Please take your time to reflect.' },
});
app.use('/api/posts', writeLimiter);

app.use(express.json());
app.use(cookieParser());

// Serve static images & files from public
app.use(express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Run initial seed if needed
seedSampleData();

app.listen(PORT, () => {
  console.log(`[Unsent Server] Running on http://localhost:${PORT}`);
});
