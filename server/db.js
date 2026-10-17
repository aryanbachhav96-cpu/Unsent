import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'unsent.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    is_banned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    author_handle TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'story',
    topic TEXT,
    title TEXT,
    body TEXT NOT NULL,
    sign_off TEXT,
    addressee TEXT,
    visibility TEXT DEFAULT 'public',
    how_long_ago TEXT,
    content_warning INTEGER DEFAULT 0,
    auto_delete_at DATETIME,
    song_title TEXT,
    song_artist TEXT,
    song_link TEXT,
    song_mood TEXT,
    book_title TEXT,
    book_author TEXT,
    book_mood_tag TEXT,
    book_review TEXT,
    is_flagged INTEGER DEFAULT 0,
    flag_reason TEXT,
    is_hidden INTEGER DEFAULT 0,
    is_sample INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    voter_hash TEXT NOT NULL,
    reaction_type TEXT NOT NULL DEFAULT 'feel',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, voter_hash, reaction_type),
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    author_handle TEXT NOT NULL,
    body TEXT NOT NULL,
    is_flagged INTEGER DEFAULT 0,
    is_hidden INTEGER DEFAULT 0,
    is_sample INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Handle generator helper
export function generateRandomHandle() {
  const adjectives = [
    'quiet', 'silent', 'distant', 'wandering', 'misty', 'hidden',
    'fading', 'midnight', 'gentle', 'solitary', 'pale', 'velvet',
    'echoing', 'drifting', 'somber', 'hollow', 'still', 'secret'
  ];
  const nouns = [
    'owl', 'fox', 'moth', 'crane', 'wolf', 'sparrow', 'deer',
    'raven', 'hare', 'loon', 'heron', 'shadow', 'ember', 'leaf', 'river'
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}_${noun}_${num}`;
}

// Seed admin account from .env
export function seedAdmin() {
  const { ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: adminPassword, ADMIN_HANDLE: adminHandle } = process.env;
  if (!adminEmail || !adminPassword || !adminHandle) {
    console.warn('[Unsent DB] Admin seed skipped; configure ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_HANDLE to seed an admin.');
    return;
  }
  if ([adminEmail, adminPassword, adminHandle].some((value) => /^replace-with-/i.test(value))) {
    console.warn('[Unsent DB] Admin seed skipped; replace the example admin values before seeding.');
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!existing) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.prepare(`
      INSERT INTO users (email, password_hash, handle, role, created_at)
      VALUES (?, ?, ?, 'admin', CURRENT_TIMESTAMP)
    `).run(adminEmail, hash, adminHandle);
    console.log(`[Unsent DB] Seeded local admin account: ${adminEmail}`);
  }
}

// Periodic auto-delete cleanup (checks posts with auto_delete_at <= CURRENT_TIMESTAMP)
export function runAutoDeleteCleanup() {
  try {
    const stmt = db.prepare(`
      DELETE FROM posts 
      WHERE auto_delete_at IS NOT NULL 
        AND datetime(auto_delete_at) <= datetime('now')
    `);
    const result = stmt.run();
    if (result.changes > 0) {
      console.log(`[Unsent DB] Cleaned up ${result.changes} expired auto-delete posts`);
    }
  } catch (err) {
    console.error('[Unsent DB] Error in auto-delete cleanup:', err.message);
  }
}

// Run cleanup on startup and every 5 minutes
runAutoDeleteCleanup();
setInterval(runAutoDeleteCleanup, 5 * 60 * 1000);

seedAdmin();

export default db;
