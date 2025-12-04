const cors = require('cors');
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 80;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const quranRoots = require('./routes/roots');
const quranChapter = require('./routes/chapter');
const quranPage = require('./routes/page');
const quranTefsir = require('./routes/tefsir');

app.use('/api/root', quranRoots);
app.use('/api/chapter', quranChapter);
app.use('/api/page', quranPage);
app.use('/api/tefsir', quranTefsir);

// Serve static files FIRST
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all for client-side routing - but NOT for files with extensions
app.use((req, res, next) => {
  // If the request has a file extension, don't handle it (let it 404)
  if (path.extname(req.path).length > 0) {
    return next();
  }
  // Otherwise, serve index.html for client-side routing
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});