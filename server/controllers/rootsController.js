const fs = require('fs').promises;
const path = require('path');

const getSingleRoot = async (req, res) => {
    const root = req.query.root;

    const filePath = path.join(__dirname, '..', 'data', 'roots', 'roots_files', `${root}.json`);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data)); // automatically sends parsed JSON
    } catch (err) {
        res.status(404).json({ error: 'Page not found' });
    }
}

const getRootsList = async (req, res) => {

    const filePath = path.join(__dirname, '..', 'data', 'roots', 'roots_info', 'sorted_roots.json');

    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(data)); // automatically sends parsed JSON
    } catch (err) {
        res.status(404).json({ error: 'Page not found' });
    }
}

module.exports = { getSingleRoot, getRootsList };