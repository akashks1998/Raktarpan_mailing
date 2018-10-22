var express = require('express');
var crypto = require('crypto');
var router = express.Router();
class user {
  constructor(nam, pas) {
    this.nam = nam;
    this.pas = crypto.createHash('md5').update(pas).digest('hex');
    this.fixed = [];
    this.deadline = [];
  }

  addfixed(start, end) {
    this.fixed.push([start,end]);
    this.fixed.sort(
      function (a ,b) {
        return a[0] > b[0]?1:-1;
      });
  }

  adddead(deadline,hour) {
    this.deadline.push([deadline,hour]);
    this.deadline.sort(
      function (a ,b) {
        return a[0] > b[0]?1:-1;
      });
  }
};
let u1 = new user("akash", "password");
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send(JSON.stringify(u1));
});

router.post('/', function (req, res, next) {
  if (req.body.start && req.body.end) {
    u1.addfixed(new Date(req.body.start), new Date(req.body.end));
  }
  if (req.body.deadline&& req.body.hour) {
    u1.adddead(new Date(req.body.deadline), req.body.hour);
  }
  res.send(JSON.stringify(u1));
});

module.exports = router;