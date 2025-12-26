const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.getPage);
router.get('/pageInfo/', pageController.getPageInfo);

module.exports = router;