const express = require('express');
require('dotenv').config();
const { connectToDB, getDB } = require('./data/db');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = 3000;

app.use(express.json());

connectToDB().then(() => {
  app.locals.db = getDB();

  app.use('/auth', authRoutes);
  app.use('/todos', todoRoutes);

  app.get('/', (req, res) => {
    res.send('Welcome to the To-Do API!');
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

}).catch(err => {
  console.error('Failed to connect to DB:', err);
});