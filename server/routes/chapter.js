const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

router.get('/', chapterController.getChapter);
router.get('/info', chapterController.getChaptersInfo);

module.exports = router;