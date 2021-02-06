const express = require('express')
const router = express.Router()

const PoolController = require('../controllers/PoolController')

router.post('/pool_creation', PoolController.pool_creation)
router.get('/pool_list', PoolController.pool_list)

module.exports = router