const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const apiRouter = require('./routes/api');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/health', healthRouter);
app.use('/api', apiRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler. Async route rejections reach here in Express 5 automatically.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
