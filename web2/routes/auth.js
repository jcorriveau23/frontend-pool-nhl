const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');

router.post('/set_username', AuthController.set_username);

module.exports = router;
