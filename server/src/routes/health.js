const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const STATE = ['disconnected', 'connected', 'connecting', 'disconnecting'];

// Liveness + readiness in one payload.
// `db` is a plain string so clients (and smoke tests) can compare it directly.
router.get('/', (req, res) => {
  const ready = mongoose.connection.readyState === 1;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    db: STATE[mongoose.connection.readyState] || 'unknown',
    database: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
    uptime: process.uptime(),
  });
});

// Dedicated readiness probe: 200 only when MongoDB is reachable.
router.get('/db', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ok' : 'unavailable',
    db: STATE[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  });
});

module.exports = router;
