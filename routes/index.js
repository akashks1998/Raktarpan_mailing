var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('fixed');
});
router.get('/fixed', function(req, res, next) {
  res.render('fixed');
});
router.get('/deadline', function(req, res, next) {
  res.render('deadline');
});
module.exports = router;
