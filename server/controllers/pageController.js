const fs = require('fs').promises;
const path = require('path');

const getPage = async (req, res) => {
    const page = req.query.page;

    const filePath = path.join(__dirname, '..', 'data', 'pages', `${page}.json`);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data)); // automatically sends parsed JSON
    } catch (err) {
        res.status(404).json({ error: 'Page not found' });
    }
}

const getPageInfo = async (req, res) => {
  const page = req.query.page;

  const filePath = path.join(__dirname, '..', 'data', 'pages', `${page}.json`);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);

    // Keep everything except verses
    const pageInfo = {
      page_number: json.page_number,
      chapters: json.chapters.map(ch => ({
        chapter_id: ch.chapter_id,
        name_arabic: ch.name_arabic,
        name_simple: ch.name_simple,
        revelation_place: ch.revelation_place,
        verses_count: ch.verses_count,
        beginning_of_surah: ch.beginning_of_surah,
        // you can add other top-level properties here if needed
      }))
    };

    res.json(pageInfo);
  } catch (err) {
    res.status(404).json({ error: 'Page not found' });
  }
};

module.exports = { getPage, getPageInfo };