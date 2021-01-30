var express = require('express');
var router = express.Router();

var data = require('./../database.json');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(data);
  });

module.exports = router;