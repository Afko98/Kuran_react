const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
require('dotenv').config(); 

const PORT = process.env.PORT || 80;
const statsFile = path.join(__dirname, 'stats.json');

// Middleware
app.use(express.json());
app.use(cors());

// Track unique daily visits
app.use((req, res, next) => {
  // Ignore API and static files
  if (req.path.startsWith('/api') || path.extname(req.path).length > 0) {
    return next();
  }

  const today = new Date().toISOString().split('T')[0];
  let stats = {};

  // Read existing stats
  if (fs.existsSync(statsFile)) {
    try {
      stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
    } catch (err) {
      console.error('Error reading stats.json:', err);
    }
  }

  // Initialize today's entry if missing
  if (!stats[today]) {
    stats[today] = { count: 0, ips: [] };
  }

  // Get visitor IP
  const visitorIp = req.ip || req.connection.remoteAddress;

  // Increment count only if this IP hasn't visited today
  if (!stats[today].ips.includes(visitorIp)) {
    stats[today].count += 1;
    stats[today].ips.push(visitorIp);
  }

  // Write back stats
  fs.writeFile(statsFile, JSON.stringify(stats, null, 2), (err) => {
    if (err) console.error('Error writing stats.json:', err);
  });

  next();
});

// Routes
const quranRoots = require('./routes/roots');
const quranChapter = require('./routes/chapter');
const quranPage = require('./routes/page');
const quranTefsir = require('./routes/tefsir');

app.use('/api/root', quranRoots);
app.use('/api/chapter', quranChapter);
app.use('/api/page', quranPage);
app.use('/api/tefsir', quranTefsir);

// Optional stats endpoint
app.get('/api/stats', (req, res) => {
  let stats = {};
  if (fs.existsSync(statsFile)) {
    try {
      stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
    } catch (err) {
      console.error('Error reading stats.json:', err);
    }
  }
  // Return simplified JSON (date: count)
  const simplified = {};
  for (const date in stats) {
    simplified[date] = stats[date].count;
  }
  res.json(simplified);
});

// Serve React frontend
app.use((req, res, next) => {
  const html = `
    <!DOCTYPE html>
    <html lang="bs">
    <head>
      <meta charset="UTF-8">
      <title>Nova stranica</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #125eb6ff, #0a9779ff);
          color: #fff;
          text-align: center;
        }
        a {
          color: #b4ff83ff;
          text-decoration: none;
          font-weight: bold;
          font-size: 2rem;
          transition: transform 0.2s, color 0.2s;
        }
        h1 {
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div>
        <h1>Nova stranica je dostupna!</h1>
        <a href="https://kuran-tefsir.pages.dev/" target="_blank">Posjeti: https://kuran-tefsir.pages.dev/</a>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
