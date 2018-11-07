let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/fixed', function(req, res, next) {
  if(req.session.user==undefined||req.session.pass==undefined){
    res.render('index');
    return;
  }
  let startt=new Date();
  startt=startt.toISOString();
  startt=startt.slice(0, -8);
  
  res.render('fixed',{start:startt});
});
router.get('/deadline', function(req, res, next) {
  if(req.session.user==undefined||req.session.pass==undefined){
    res.render('index');
    return;
  }
  let startt=new Date();
  startt=startt.toISOString();
  startt=startt.slice(0, -8);
  res.render('deadline',{start:startt});
});
module.exports = router;
