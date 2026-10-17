import express from 'express';
import db, { generateRandomHandle } from '../db.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { checkCrisis, checkPII, checkOccultStrict, hashClientIp } from '../safety.js';

const router = express.Router();

// GET /api/posts - Fetch public feed with filters & sort
router.get('/', optionalAuth, (req, res) => {
  try {
    const { type, topic, sort = 'newest', search } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let query = `
      SELECT p.*,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'feel') AS feel_count,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'agree') AS agree_count,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'different') AS different_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.is_hidden = 0) AS comment_count
      FROM posts p
      WHERE p.is_hidden = 0
    `;
    const params = [];

    // STRICT SERVER ENFORCEMENT: Never return 'vault' posts on public feed!
    // Vault posts can ONLY be fetched via /api/posts/my-vault by their owner.
    query += ` AND p.visibility != 'vault'`;

    if (type) {
      query += ` AND p.type = ?`;
      params.push(type);
    }

    if (topic && topic !== 'All') {
      query += ` AND p.topic = ?`;
      params.push(topic);
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.body LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'felt') {
      query += ` ORDER BY feel_count DESC, p.created_at DESC`;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    query += ` LIMIT 100`;

    const posts = db.prepare(query).all(...params);

    // Compute whether current user or guest has reacted
    const voterHash = req.user ? `u_${req.user.id}` : `ip_${hashClientIp(req.ip)}`;
    const userReactions = db.prepare(`
      SELECT post_id, reaction_type FROM reactions WHERE voter_hash = ?
    `).all(voterHash);

    const reactionMap = {};
    for (const r of userReactions) {
      if (!reactionMap[r.post_id]) reactionMap[r.post_id] = {};
      reactionMap[r.post_id][r.reaction_type] = true;
    }

    const enhanced = posts.map(post => ({
      ...post,
      userFelt: !!(reactionMap[post.id]?.feel),
      userAgreed: !!(reactionMap[post.id]?.agree),
      userDiffered: !!(reactionMap[post.id]?.different),
      isOwner: currentUserId ? post.user_id === currentUserId : false,
    }));

    res.json({ posts: enhanced });
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Could not fetch posts' });
  }
});

// GET /api/posts/vault - Strictly owner-only letters vault
router.get('/my-vault', requireAuth, (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT * FROM posts 
      WHERE user_id = ? AND visibility = 'vault'
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ letters: posts });
  } catch (err) {
    console.error('Vault error:', err);
    res.status(500).json({ error: 'Could not fetch private vault' });
  }
});

// GET /api/posts/my - Private dashboard items owned by current user
router.get('/my-content', requireAuth, (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM reactions r WHERE r.post_id = p.id AND r.reaction_type = 'feel') AS feel_count
      FROM posts p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    res.json({ posts });
  } catch (err) {
    console.error('My content error:', err);
    res.status(500).json({ error: 'Could not fetch user content' });
  }
});

// GET /api/posts/:id/comments - Fetch comments for a post
router.get('/:id/comments', (req, res) => {
  try {
    const postId = req.params.id;
    const comments = db.prepare(`
      SELECT id, post_id, author_handle, body, created_at 
      FROM comments 
      WHERE post_id = ? AND is_hidden = 0
      ORDER BY created_at ASC
    `).all(postId);

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch comments' });
  }
});

// POST /api/posts - Create post (with safety & crisis check)
router.post('/', optionalAuth, (req, res) => {
  try {
    const {
      title,
      body,
      topic = 'Other',
      type = 'story',
      sign_off,
      addressee,
      visibility = 'public',
      how_long_ago,
      content_warning = 0,
      auto_delete_hours = 0,
      song_title,
      song_artist,
      song_link,
      song_mood,
      book_title,
      book_author,
      book_mood_tag,
      book_review,
      confirmedCrisis = false,
    } = req.body;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Body text is required' });
    }

    const fullText = `${title || ''} ${body} ${sign_off || ''} ${book_review || ''}`;

    // 1. Crisis Check: If triggered and not explicitly confirmed, return crisis intervention response
    const crisisCheck = checkCrisis(fullText);
    if (crisisCheck.isCrisis && !confirmedCrisis) {
      return res.status(200).json({
        needsCrisisConfirmation: true,
        crisisMessage: crisisCheck.message,
      });
    }

    // 2. PII Check: Auto-flag if detected
    const piiCheck = checkPII(fullText);
    let isFlagged = 0;
    let flagReason = null;

    if (piiCheck.hasPII) {
      isFlagged = 1;
      flagReason = piiCheck.reason;
    }

    // 3. Occult Strict Check: Auto-flag if ritual or recruitment
    if (type === 'occult' || topic === 'Occult') {
      const occultCheck = checkOccultStrict(fullText);
      if (occultCheck.isDisallowed) {
        isFlagged = 1;
        flagReason = occultCheck.reason;
      }
    }

    // Determine author handle
    let authorHandle;
    let userId = null;

    if (req.user) {
      authorHandle = req.user.handle;
      userId = req.user.id;
    } else {
      // Guest handle from body or newly generated
      authorHandle = req.body.guest_handle || generateRandomHandle();
    }

    // Calculate auto_delete_at if requested
    let autoDeleteAt = null;
    if (auto_delete_hours === 24) {
      autoDeleteAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (auto_delete_hours === 168) { // 7 days
      autoDeleteAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    const stmt = db.prepare(`
      INSERT INTO posts (
        user_id, author_handle, type, topic, title, body, sign_off, addressee,
        visibility, how_long_ago, content_warning, auto_delete_at,
        song_title, song_artist, song_link, song_mood,
        book_title, book_author, book_mood_tag, book_review,
        is_flagged, flag_reason, is_hidden, is_sample, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 0, 0, CURRENT_TIMESTAMP
      )
    `);

    const result = stmt.run(
      userId,
      authorHandle,
      type,
      topic,
      title?.trim() || null,
      body.trim(),
      sign_off?.trim() || null,
      addressee?.trim() || null,
      visibility,
      how_long_ago?.trim() || null,
      content_warning ? 1 : 0,
      autoDeleteAt,
      song_title?.trim() || null,
      song_artist?.trim() || null,
      song_link?.trim() || null,
      song_mood?.trim() || null,
      book_title?.trim() || null,
      book_author?.trim() || null,
      book_mood_tag?.trim() || null,
      book_review?.trim() || null,
      isFlagged,
      flagReason
    );

    res.status(201).json({
      success: true,
      id: Number(result.lastInsertRowid),
      author_handle: authorHandle,
      warningNotice: piiCheck.hasPII
        ? 'A gentle note: We detected potential personal contact details or addresses. For your privacy, this post has been queued for review.'
        : null,
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Could not share post' });
  }
});

// POST /api/posts/:id/react - Toggle reaction ("feel", "agree", "different")
router.post('/:id/react', optionalAuth, (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { reaction_type = 'feel' } = req.body;
    const voterHash = req.user ? `u_${req.user.id}` : `ip_${hashClientIp(req.ip)}`;

    const existing = db.prepare(`
      SELECT id FROM reactions 
      WHERE post_id = ? AND voter_hash = ? AND reaction_type = ?
    `).get(postId, voterHash, reaction_type);

    if (existing) {
      db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
      return res.json({ reacted: false });
    } else {
      db.prepare(`
        INSERT INTO reactions (post_id, voter_hash, reaction_type)
        VALUES (?, ?, ?)
      `).run(postId, voterHash, reaction_type);
      return res.json({ reacted: true });
    }
  } catch (err) {
    console.error('Reaction error:', err);
    res.status(500).json({ error: 'Could not record reaction' });
  }
});

// POST /api/posts/:id/comments - Add comment (anonymous, rate limited, crisis-checked)
router.post('/:id/comments', optionalAuth, (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { body, confirmedCrisis = false } = req.body;

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const crisisCheck = checkCrisis(body);
    if (crisisCheck.isCrisis && !confirmedCrisis) {
      return res.status(200).json({
        needsCrisisConfirmation: true,
        crisisMessage: crisisCheck.message,
      });
    }

    const piiCheck = checkPII(body);
    const isFlagged = piiCheck.hasPII ? 1 : 0;

    let authorHandle;
    let userId = null;
    if (req.user) {
      authorHandle = req.user.handle;
      userId = req.user.id;
    } else {
      authorHandle = req.body.guest_handle || generateRandomHandle();
    }

    const info = db.prepare(`
      INSERT INTO comments (post_id, user_id, author_handle, body, is_flagged, is_hidden, is_sample)
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `).run(postId, userId, authorHandle, body.trim(), isFlagged);

    res.status(201).json({
      comment: {
        id: Number(info.lastInsertRowid),
        post_id: postId,
        author_handle: authorHandle,
        body: body.trim(),
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Could not post comment' });
  }
});

// DELETE /api/posts/:id - Permanently delete own content
router.delete('/:id', optionalAuth, (req, res) => {
  try {
    const postId = Number(req.params.id);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Admins or content owner can delete
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && post.user_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
    res.json({ success: true, message: 'Post permanently removed' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Could not delete post' });
  }
});

// POST /api/posts/report - Report post or comment
router.post('/report', (req, res) => {
  try {
    const { target_type, target_id, reason, details } = req.body;
    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ error: 'Missing report fields' });
    }

    db.prepare(`
      INSERT INTO reports (target_type, target_id, reason, details, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(target_type, Number(target_id), reason, details?.trim() || null);

    res.status(201).json({ success: true, message: 'Thank you for keeping our sanctuary safe.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not submit report' });
  }
});

export default router;
