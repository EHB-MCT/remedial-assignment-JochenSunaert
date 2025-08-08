require('dotenv').config();
const express = require('express');
const cors = require('cors');
const upgradesRouter = require('./routes/upgrades'); // Optional, if you're still using this
const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

http://localhost:3001/api/upgrades/available?userId=[userId] // Example endpoint to fetch available upgrades
app.use('/api/upgrades', upgradesRouter);

// ✅ Fetch user base data (name + level)
app.get('/api/user-base-data', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const { data, error } = await supabase
    .from('user_base_data')
    .select('name, current_level')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user base data:', error);
    return res.status(500).json({ error: 'Failed to fetch user base data' });
  }

  res.json(data);
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
