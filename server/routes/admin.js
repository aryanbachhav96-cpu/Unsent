import express from 'express';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin endpoints with requireAdmin
router.use(requireAdmin);

// GET /api/admin/reports - Get pending reports with target details
router.get('/reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.* 
      FROM reports r 
      ORDER BY r.created_at DESC
    `).all();

    // Enhance each report with target content
    const enhanced = reports.map(rep => {
      let target = null;
      if (rep.target_type === 'post') {
        target = db.prepare('SELECT id, author_handle, title, body, is_hidden, is_flagged, flag_reason FROM posts WHERE id = ?').get(rep.target_id);
      } else if (rep.target_type === 'comment') {
        target = db.prepare('SELECT id, author_handle, body, is_hidden, is_flagged FROM comments WHERE id = ?').get(rep.target_id);
      }
      return { ...rep, target };
    });

    res.json({ reports: enhanced });
  } catch (err) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: 'Could not fetch reports' });
  }
});

// GET /api/admin/flagged - Get auto-flagged posts
router.get('/flagged', (req, res) => {
  try {
    const flaggedPosts = db.prepare(`
      SELECT id, author_handle, type, topic, title, body, flag_reason, is_hidden, created_at 
      FROM posts 
      WHERE is_flagged = 1 
      ORDER BY created_at DESC
    `).all();
    res.json({ posts: flaggedPosts });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch flagged posts' });
  }
});

// POST /api/admin/reports/:id/action - Moderate content (hide, restore, remove, dismiss)
router.post('/reports/:id/action', (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const { action } = req.body; // 'hide', 'restore', 'remove', 'dismiss'

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (action === 'hide') {
      if (report.target_type === 'post') {
        db.prepare('UPDATE posts SET is_hidden = 1 WHERE id = ?').run(report.target_id);
      } else {
        db.prepare('UPDATE comments SET is_hidden = 1 WHERE id = ?').run(report.target_id);
      }
      db.prepare("UPDATE reports SET status = 'reviewed' WHERE id = ?").run(reportId);
    } else if (action === 'restore') {
      if (report.target_type === 'post') {
        db.prepare('UPDATE posts SET is_hidden = 0 WHERE id = ?').run(report.target_id);
      } else {
        db.prepare('UPDATE comments SET is_hidden = 0 WHERE id = ?').run(report.target_id);
      }
      db.prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?").run(reportId);
    } else if (action === 'remove') {
      if (report.target_type === 'post') {
        db.prepare('DELETE FROM posts WHERE id = ?').run(report.target_id);
      } else {
        db.prepare('DELETE FROM comments WHERE id = ?').run(report.target_id);
      }
      db.prepare("UPDATE reports SET status = 'reviewed' WHERE id = ?").run(reportId);
    } else if (action === 'dismiss') {
      db.prepare("UPDATE reports SET status = 'dismissed' WHERE id = ?").run(reportId);
    }

    res.json({ success: true, message: `Report action '${action}' completed` });
  } catch (err) {
    res.status(500).json({ error: 'Could not update report' });
  }
});

// POST /api/admin/ban - Ban or unban a handle
router.post('/ban', (req, res) => {
  try {
    const { handle, is_banned = 1 } = req.body;
    if (!handle) {
      return res.status(400).json({ error: 'Handle is required' });
    }

    const info = db.prepare('UPDATE users SET is_banned = ? WHERE handle = ?').run(is_banned ? 1 : 0, handle);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'User handle not found' });
    }

    res.json({ success: true, message: `Handle ${handle} ${is_banned ? 'restricted' : 'unrestricted'}` });
  } catch (err) {
    res.status(500).json({ error: 'Could not update ban status' });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, handle, email, role, is_banned, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// POST /api/admin/clear-sample-data - Adjustment 5: "Clear sample data deletes only is_sample rows"
router.post('/clear-sample-data', (req, res) => {
  try {
    const delComments = db.prepare('DELETE FROM comments WHERE is_sample = 1').run();
    const delPosts = db.prepare('DELETE FROM posts WHERE is_sample = 1').run();

    res.json({
      success: true,
      message: `Cleared sample data: removed ${delPosts.changes} posts and ${delComments.changes} comments.`,
    });
  } catch (err) {
    console.error('Clear sample error:', err);
    res.status(500).json({ error: 'Could not clear sample data' });
  }
});

export default router;
