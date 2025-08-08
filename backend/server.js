require('dotenv').config();
const express = require('express');
const cors = require('cors');


const upgradesRouter = require('./routes/upgrades');
const userBaseDataRouter = require('./routes/userBaseData');


const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

http://localhost:3001/api/upgrades/available?userId=[userId] // Example endpoint to fetch available upgrades
app.use('/api/upgrades', upgradesRouter);

app.use('/api/user-base-data', userBaseDataRouter);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
