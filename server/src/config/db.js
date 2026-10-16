const mongoose = require('mongoose');

/**
 * Connect to MongoDB and resolve once the connection is ready.
 * Mongoose buffers commands by default, but failing fast here keeps
 * startup errors (bad URI, network, auth) obvious instead of silent.
 */
async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  mongoose.connection.on('connected', () => {
    console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

async function disconnectDB() {
  await mongoose.connection.close();
  console.log('[db] connection closed');
}

module.exports = { connectDB, disconnectDB };
