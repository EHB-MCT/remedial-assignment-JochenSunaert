require('dotenv').config();
const express = require('express');
const cors = require('cors');

const upgradesRouter = require('./routes/upgrades');
const userBaseDataRouter = require('./routes/userBaseData');
const economyRoutes = require('./routes/economy'); // still used if it has extra routes

const supabase = require('./supabaseClient');

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

// ✅ GET economy by userId (needed for your frontend)
app.get('/api/user-economy/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('user_economy')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json(data);
});

// ✅ POST update economy (your original update route, but fixed for Supabase)
app.post('/api/user-economy/update', async (req, res) => {
  const { userId, has_gold_pass, builders_count, gold_amount, elixir_amount } = req.body;

  const { error } = await supabase
    .from('user_economy')
    .update({
      has_gold_pass,
      builders_count,
      gold_amount,
      elixir_amount
    })
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true });
});

// ✅ Alternative alias for status update (to match your frontend call)
app.post('/api/user-economy/status', async (req, res) => {
  const { userId, has_gold_pass, builders_count, gold_amount, elixir_amount } = req.body;

  const { error } = await supabase
    .from('user_economy')
    .update({
      has_gold_pass,
      builders_count,
      gold_amount,
      elixir_amount
    })
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
