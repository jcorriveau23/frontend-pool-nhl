const express = require('express')
const router = express.Router()

const PoolController = require('../controllers/PoolController')

router.post('/pool_creation', PoolController.pool_creation)

router.get('/pool_list', PoolController.pool_list)
router.get('/get_pool_info', PoolController.get_pool_info)

router.put('/new_participant', PoolController.new_participant)
module.exports = router