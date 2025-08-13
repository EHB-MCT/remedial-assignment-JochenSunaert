/**
 * User base data routes
 * - Read current placed defenses and levels for a user
 */

const express = require('express');
const { supabase } = require('../database/supabaseClient');

const router = express.Router();

/**
 * List base data for a user (defense instance name + current level).
 * @route GET /api/user-base-data?userId=...
 */
router.get('/', async (req, res) => {
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

module.exports = router;
