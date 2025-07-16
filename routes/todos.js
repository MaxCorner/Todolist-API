const { ObjectId } = require('mongodb');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const todos = await db.collection('todos').find({ userId: req.user.userId }).toArray();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  try {
    const db = req.app.locals.db;
    const result = await db.collection('todos').insertOne({
      task,
      completed: false,
      userId: req.user.userId
    });
    res.status(201).json({ _id: result.insertedId, task, completed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  console.log('Incoming ID:', id);
  console.log('Body:', req.body);

  try {
    const db = req.app.locals.db;

    const updateFields = {};
    if (task !== undefined) updateFields.task = task;
    if (completed !== undefined) updateFields.completed = completed;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const objectId = new ObjectId(id);

    const updateResult = await db.collection('todos').updateOne(
      { _id: objectId, userId: req.user.userId },
      { $set: updateFields }
    );

    console.log('updateOne result:', updateResult);

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = await db.collection('todos').findOne({ _id: objectId });

    res.json(updatedTodo);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = req.app.locals.db;
    const objectId = new ObjectId(id);

    const todo = await db.collection('todos').findOne({ _id: objectId, userId: req.user.userId });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await db.collection('todos').deleteOne({ _id: objectId, userId: req.user.userId });

    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;