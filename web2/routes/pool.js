const express = require('express');
const router = express.Router();

const PoolController = require('../controllers/PoolController');

router.put('/protect_players', PoolController.protected_players);

module.exports = router;
