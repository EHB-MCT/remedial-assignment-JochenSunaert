/**
 * Application entrypoint.
 * - Loads environment variables
 * - Configures Express middlewares
 * - Mounts route modules under /api/*
 * - Starts the HTTP server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route modules
const upgradesRouter = require('./routes/upgrades');
const userBaseDataRouter = require('./routes/userBaseData');
const economyRoutes = require('./routes/economy');
const userEconomyRouter = require('./routes/userEconomy');

const app = express();
const port = process.env.PORT || 3001;

// Global middleware
app.use(cors());               // Allow cross-origin requests
app.use(express.json());       // Parse JSON request bodies

/**
 * Healthcheck endpoint
 * @route GET /api/healthcheck
 * @returns {object} 200 - { status: 'ok' }
 */
app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'ok' });
});

// Feature routes
app.use('/api/upgrades', upgradesRouter);
app.use('/api/user-base-data', userBaseDataRouter);
app.use('/api/economy', economyRoutes);
app.use('/api/user-economy', userEconomyRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
