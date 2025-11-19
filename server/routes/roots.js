const express = require('express');
const router = express.Router();
const rootsController = require('../controllers/rootsController');

router.get('/', rootsController.getSingleRoot);
router.get('/all', rootsController.getRootsList);

module.exports = router;