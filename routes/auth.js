const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET;


const ADMIN_SIGNUP_KEY = process.env.ADMIN_SIGNUP_KEY;

router.post('/signup', async (req, res) => {
  const { username, password, adminKey } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Missing username or password' });

  const db = req.app.locals.db;

  try {
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: 'Username taken' });

    const passwordHash = await bcrypt.hash(password, 10);

    const isAdmin = adminKey === ADMIN_SIGNUP_KEY;

    const result = await db.collection('users').insertOne({
      username,
      passwordHash,
      isAdmin,
    });

    res.status(201).json({ message: 'User created', userId: result.insertedId, isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const db = req.app.locals.db;

  try {
    const user = await db.collection('users').findOne({ username });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        username: user.username,
        isAdmin: user.isAdmin || false
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/account', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid auth token' });
  }

  const token = authHeader.split(' ')[1];

  const { currentPassword, newUsername, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = new ObjectId(decoded.userId);

    const db = req.app.locals.db;
    const user = await db.collection('users').findOne({ _id: userId });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid current password' });

    const updateFields = {};

    if (newUsername) {
      const usernameTaken = await db.collection('users').findOne({ username: newUsername });
      if (usernameTaken) return res.status(400).json({ error: 'Username taken' });
      updateFields.username = newUsername;
    }

    if (newPassword) {
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      updateFields.passwordHash = newPasswordHash;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No new data provided' });
    }

    await db.collection('users').updateOne({ _id: userId }, { $set: updateFields });

    res.json({ message: 'Account updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

module.exports = router;