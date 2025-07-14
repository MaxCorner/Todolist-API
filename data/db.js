const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

async function connectToDB() {
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
}

function getDB() {
  if (!db) throw new Error('DB not connected!');
  return db;
}

module.exports = { connectToDB, getDB };
