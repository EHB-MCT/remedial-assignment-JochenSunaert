const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// GET economy by userId
router.get('/:userId', async (req, res) => {
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

// POST update economy
router.post('/update', async (req, res) => {
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

// POST status update alias
router.post('/status', async (req, res) => {
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

module.exports = router;
