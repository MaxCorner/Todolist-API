const express = require('express');
require('dotenv').config();
const { connectToDB, getDB } = require('./data/db');

const app = express();

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const PORT = 3000;

app.use(express.json());

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

connectToDB().then(() => {
  app.locals.db = getDB();

  app.get('/', (req, res) => {
    res.send('Welcome to the Todolist API!');
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

}).catch(err => {
  console.error('Failed to connect to DB:', err);
});
