const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set');
  }

  // Fail fast in serverless to avoid hitting function timeout.
  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000
  });

  try {
    cachedConnection = await cachedPromise;
    return cachedConnection;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
}

module.exports = { connectDB };
