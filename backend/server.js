require('dotenv').config();
const express = require('express');
const cors = require('cors');

const upgradesRouter = require('./routes/upgrades');
const userBaseDataRouter = require('./routes/userBaseData');
const economyRoutes = require('./routes/economy'); 
const userEconomyRouter = require('./routes/userEconomy'); 

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/healthcheck', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/api/upgrades', upgradesRouter);
app.use('/api/user-base-data', userBaseDataRouter);
app.use('/api/economy', economyRoutes);
app.use('/api/user-economy', userEconomyRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
