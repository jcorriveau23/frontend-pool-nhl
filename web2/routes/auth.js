const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");

router.post("/register", AuthController.register);
router.post("/wallet_login", AuthController.wallet_login);
router.post("/login", AuthController.login);
router.post("/set_username", AuthController.set_username);

router.get("/get_all_users", AuthController.get_all_users);

module.exports = router;
