var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let startt=new Date();
  startt=startt.toISOString();
  startt=startt.slice(0, -8);
  console.log(new Date());
  
  res.render('fixed',{start:startt});
});
router.get('/fixed', function(req, res, next) {
  let startt=new Date();
  startt=startt.toISOString();
  startt=startt.slice(0, -8);
  res.render('fixed',{start:startt.toISOString()});
});
router.get('/deadline', function(req, res, next) {
  res.render('deadline');
});
module.exports = router;
