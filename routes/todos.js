const { ObjectId } = require('mongodb');
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db;

    let query = {};
    if (!req.user.isAdmin) {
      query.userId = req.user.userId;
    }

    const todos = await db.collection('todos').find(query).toArray();
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  const { task, userId } = req.body;

  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }

  if (userId && !ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const db = req.app.locals.db;

    const todoUserId = (req.user.isAdmin && userId) ? userId : req.user.userId;

    const result = await db.collection('todos').insertOne({
      task,
      completed: false,
      userId: todoUserId,
    });

    res.status(201).json({ _id: result.insertedId, task, completed: false, userId: todoUserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  try {
    const db = req.app.locals.db;
    const objectId = new ObjectId(id);

    const updateFields = {};
    if (task !== undefined) updateFields.task = task;
    if (completed !== undefined) updateFields.completed = completed;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const query = req.user.isAdmin ? { _id: objectId } : { _id: objectId, userId: req.user.userId };

    const updateResult = await db.collection('todos').updateOne(query, { $set: updateFields });

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Todo not found or not authorized' });
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

    const query = req.user.isAdmin ? { _id: objectId } : { _id: objectId, userId: req.user.userId };

    const todo = await db.collection('todos').findOne(query);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or not authorized' });
    }

    await db.collection('todos').deleteOne(query);
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;