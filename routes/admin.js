const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;

    const users = await db.collection('users').find().toArray();
    const todos = await db.collection('todos').find().toArray();

    res.json({
      message: `Welcome, ${req.user.username} to the Admin Dashboard!`,
      users,
      todos,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;