const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Get feed posts
router.get('/feed', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.username, u.email, u.account_type,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.visibility = 'public'
       ORDER BY p.created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Upload post media
router.post('/upload', authMiddleware, upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file uploaded' });
    }

    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(201).json({ mediaUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, media_urls, post_type, visibility } = req.body;

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, media_urls, post_type, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, content, JSON.stringify(media_urls), post_type, visibility]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Delete post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.postId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found or not authorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get post comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.postId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.postId, req.user.id, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Edit comment
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    const result = await pool.query(
      `UPDATE comments
       SET content = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND post_id = $4
       RETURNING *`,
      [content, req.params.commentId, req.user.id, req.params.postId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

// Like post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.params.postId, req.user.id]
    );

    res.json({ message: 'Post liked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike post
router.delete('/:postId/like', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
      [req.params.postId, req.user.id]
    );

    res.json({ message: 'Post unliked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

module.exports = router;
