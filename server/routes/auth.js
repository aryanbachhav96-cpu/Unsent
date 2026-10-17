import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { generateRandomHandle } from '../db.js';
import { getCookieOptions, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured before starting the server.');
}

// Signup
router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  // Generate unique handle
  let handle = generateRandomHandle();
  let tries = 0;
  while (db.prepare('SELECT id FROM users WHERE handle = ?').get(handle) && tries < 10) {
    handle = generateRandomHandle();
    tries++;
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const info = db.prepare(`
      INSERT INTO users (email, password_hash, handle, role, created_at)
      VALUES (?, ?, ?, 'user', CURRENT_TIMESTAMP)
    `).run(email.toLowerCase().trim(), hash, handle);

    const token = jwt.sign({ id: Number(info.lastInsertRowid) }, JWT_SECRET, { expiresIn: '30d' });
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      user: {
        id: Number(info.lastInsertRowid),
        handle,
        role: 'user',
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.is_banned) {
    return res.status(403).json({ error: 'This account has been restricted' });
  }

  const matches = bcrypt.compareSync(password, user.password_hash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('token', token, getCookieOptions());

  res.json({
    user: {
      id: user.id,
      handle: user.handle,
      role: user.role,
    },
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.json({ message: 'Logged out successfully' });
});

// Current user profile check
router.get('/me', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({
    user: {
      id: req.user.id,
      handle: req.user.handle,
      role: req.user.role,
    },
  });
});

export default router;
