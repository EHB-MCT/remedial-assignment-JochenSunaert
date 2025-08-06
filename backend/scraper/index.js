require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const baseUrl = 'https://clashofclans.fandom.com/wiki';

async function scrapeTroops() {
  const url = `${baseUrl}/Troops`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);

  const html = await response.text();
  const $ = cheerio.load(html);

  const upgrades = [];

  // Example: Scrape troops upgrade table(s)
  // Inspect the wiki page to find the right selector for the table
  // For example, troop upgrade tables might be inside '.wikitable' classes

  $('.wikitable').each((i, table) => {
    // For simplicity, just grab rows for troops with upgrade info
    $(table).find('tbody tr').each((j, row) => {
      const cells = $(row).find('td');
      if (cells.length === 0) return; // skip header or empty rows

      // Extract data from cells, adjust indices based on the actual table structure
      const name = $(cells[0]).text().trim();
      const level = $(cells[1]).text().trim();
      const time = $(cells[2]).text().trim();
      const goldCost = $(cells[3]).text().trim();
      const elixirCost = $(cells[4]).text().trim();
      const darkElixirCost = $(cells[5]).text() ? $(cells[5]).text().trim() : '0';

      // Normalize / parse data as needed, e.g. time to seconds, costs to numbers
      upgrades.push({
        name,
        type: 'troop',
        level: parseInt(level, 10),
        time_sec: parseTimeToSeconds(time),
        gold_cost: parseCost(goldCost),
        elixir_cost: parseCost(elixirCost),
        dark_elixir_cost: parseCost(darkElixirCost),
      });
    });
  });

  return upgrades;
}

function parseTimeToSeconds(timeStr) {
  // crude parsing: e.g. "1d 2h 30m" → total seconds
  let seconds = 0;
  const dayMatch = timeStr.match(/(\d+)d/);
  const hourMatch = timeStr.match(/(\d+)h/);
  const minMatch = timeStr.match(/(\d+)m/);

  if (dayMatch) seconds += parseInt(dayMatch[1]) * 86400;
  if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;
  if (minMatch) seconds += parseInt(minMatch[1]) * 60;

  return seconds;
}

function parseCost(costStr) {
  // remove commas and non-numeric chars, parse int
  return parseInt(costStr.replace(/[^0-9]/g, ''), 10) || 0;
}

// Example usage
(async () => {
  try {
    const troopUpgrades = await scrapeTroops();
    console.log('Scraped troop upgrades:', troopUpgrades);

    // TODO: Insert troopUpgrades into your upgrades DB table

  } catch (error) {
    console.error('Scraper error:', error);
  }
})();
