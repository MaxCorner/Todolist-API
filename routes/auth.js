const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET;


router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Missing username or password' });

  const db = req.app.locals.db;

  try {
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser)
      return res.status(400).json({ error: 'Username taken' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.collection('users').insertOne({
      username,
      passwordHash,
    });

    res.status(201).json({ message: 'User created', userId: result.insertedId });
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
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;