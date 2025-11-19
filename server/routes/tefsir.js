const express = require('express');
const router = express.Router();
const tefsirController = require('../controllers/tefsirController');

router.get('/', tefsirController.getTefsir);

module.exports = router;