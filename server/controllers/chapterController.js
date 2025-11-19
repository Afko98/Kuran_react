const fs = require('fs').promises;
const path = require('path');

const getChapter = async (req, res) => {
    const chapter = req.query.chapter;

    const filePath = path.join(__dirname, '..', 'data', 'chapters', `${chapter}.json`);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data)); // automatically sends parsed JSON
    } catch (err) {
        res.status(404).json({ error: 'Page not found' });
    }
}

module.exports = { getChapter };