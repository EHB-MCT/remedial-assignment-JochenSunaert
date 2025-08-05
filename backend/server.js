// backend/server.js
require('dotenv').config();
const express = require('express');
const supabase = require('./supabaseClient');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');

  if (error) {
    console.error('DB error:', error);
    return res.status(500).send('DB error');
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
