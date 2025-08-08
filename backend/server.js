require('dotenv').config();
const express = require('express');
const cors = require('cors');
const upgradesRouter = require('./routes/upgrades'); // if not already added
const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // <--- allow cross-origin requests
app.use(express.json());

// Register your route
app.use('/api/upgrades', upgradesRouter);

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('defense_upgrades').select('*');

  if (error) {
    console.error('DB error:', error);
    return res.status(500).send('DB error');
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
