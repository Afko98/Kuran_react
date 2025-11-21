const cors = require('cors');
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

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

// Serve React build (for production)
// app.use(express.static(path.join(__dirname, '../client/dist')));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
