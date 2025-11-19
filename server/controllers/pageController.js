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

module.exports = { getPage };