const fs = require('fs').promises;
const path = require('path');

const getTefsir = async (req, res) => {
  const chapter = req.query.chapter;
  const ayah = Number(req.query.ayah);

  const dirPath = path.join(__dirname, '..', 'data', 'tefsir');

  try {
    const files = await fs.readdir(dirPath);
    const match = files.find(f => f.startsWith(chapter) && f.endsWith('.json'));

    if (!match) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(dirPath, match);

    const file_content = await fs.readFile(filePath, 'utf8');
    const content = JSON.parse(file_content);

    const data = content.find(item => item.ayahs.includes(ayah));
    console.log(data)

    res.send(data); // if it's HTML
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTefsir };
