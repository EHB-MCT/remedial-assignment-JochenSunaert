// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase setup using your .env variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');

  if (error) {
    console.error('DB error:', error);
    return res.status(500).send('DB error');
  }

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
