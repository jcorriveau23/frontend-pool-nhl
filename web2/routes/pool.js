const express = require("express");
const router = express.Router();

const PoolController = require("../controllers/PoolController");

router.post("/pool_creation", PoolController.pool_creation);
router.post("/delete_pool", PoolController.delete_pool);

router.get("/pool_list", PoolController.pool_list);
router.get("/get_pool_info", PoolController.get_pool_info);
router.get("/get_pool_stats", PoolController.get_pool_stats);
router.get("/get_all_players", PoolController.get_all_players);
router.get("/get_day_leaders", PoolController.get_day_leaders);

router.put("/start_draft", PoolController.start_draft);
router.put("/chose_player", PoolController.chose_player);
router.put("/protect_players", PoolController.protected_players);

module.exports = router;
