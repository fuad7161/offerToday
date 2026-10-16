require('dotenv').config();

const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[startup] failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
})();
