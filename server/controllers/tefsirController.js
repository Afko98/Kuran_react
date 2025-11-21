const fs = require('fs').promises;
const path = require('path');

const getTefsir = async (req, res) => {
    const tefsir_of_chapter = req.query.tefsir_of_chapter;

    const filePath = path.join(__dirname, '..', 'data', 'tefsir', `${tefsir_of_chapter}.html`);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data)); // automatically sends parsed JSON
    } catch (err) {
        res.status(404).json({ error: 'Page not found' });
    }
}

module.exports = { getTefsir };