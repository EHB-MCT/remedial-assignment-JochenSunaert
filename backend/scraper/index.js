// scraper/index.js
const axios = require('axios'); // install if needed

async function scrapeExample() {
  const res = await axios.get('https://example.com');
  console.log(res.data);
}

scrapeExample();
