const express = require('express');
const router = express.Router();

const { ObjectId } = require('mongodb');

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

router.put('/promote/:userId', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can promote users' });
  }

  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const db = req.app.locals.db;
    const objectId = new ObjectId(userId);

    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: { isAdmin: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User promoted to admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

router.put('/demote/:userId', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can demote users' });
  }

  const { userId } = req.params;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const db = req.app.locals.db;
    const objectId = new ObjectId(userId);

    const result = await db.collection('users').updateOne(
      { _id: objectId },
      { $set: { isAdmin: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User demoted from admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to demote user' });
  }
});


module.exports = router;