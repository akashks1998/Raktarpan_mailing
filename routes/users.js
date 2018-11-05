var express = require("express");

var url = "mongodb://localhost:27017/mydb";
let id = 0;
var crypto = require("crypto");
var router = express.Router();
class user {
  constructor(nam, pas) {
    this.nam = nam;
    this.pas = crypto
      .createHash("md5")
      .update(pas)
      .digest("hex");
    this.fixed = [];
    this.deadline = [];
    this.idfix = 0;
    this.iddead = 0;
    this.scedule = [];
    this.err = 0;
    this.hour = 0;
  }

  addfixed(start, end, name) {
    if (start > end) {
      this.err = this.err + 1;
      return;
    }
    this.fixed.forEach(element => {
      if (element[0] < end && element[1] > start) {
        this.err = this.err + 1;
        return;
      }
    });
    this.fixed.push([start, end, name, this.idfix]);
    this.fixed.sort(function(a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    this.idfix = this.idfix + 1;
    this.sceduler();
  }

  adddead(deadline, hour, name) {
    if (hour < 0) {
      this.err++;
      return;
    }
    this.deadline.push([deadline, hour, name, this.iddead]);
    this.deadline.sort(function(a, b) {
      return a[0] > b[0] ? 1 : -1;
    });
    this.iddead = this.iddead + 1;
    this.sceduler();
  }
  updatefixed(id, updte) {
    for (i = 0; i < this.fixed.length; i++) {
      if (this.fixed[i][3] == id) {
        this.fixed[i] = updte;
      }
    }
  }
  updatedead(id, updte) {
    for (i = 0; i < this.deadline.length; i++) {
      if (this.deadline[i][3] == id) {
        this.deadline[i] = updte;
      }
    }
  }

  sceduler() {
    this.x = new Date();
    console.log(this.x.getHours());

    if (this.x.getHours() < 7) {
      this.scedule = [0, 0, "Sleep"];
      return;
    }
    if (
      this.deadline.length != 0 &&
      (this.fixed.length == 0 || this.x < this.fixed[0][0])
    ) {
      if (this.hour < 3 || this.deadline.length < 2) {
        if (this.deadline[0][1] <= 0) {
          this.deadline.shift();
          this.sceduler();
          return;
        }
        if (this.deadline[0][0] < this.x) {
          this.errr = 1 + this.err;
          this.deadline.shift();
          this.sceduler();
          return;
        }
        this.deadline[0][1] = this.deadline[0][1] - 1;
        this.scedule = this.deadline[0];
        this.hour = (this.hour + 1) % 3;
        return;
      } else {
        if (this.deadline[1][1] <= 0) {
          this.deadline.splice(1, 1);
          this.sceduler();
          return;
        }
        if (this.deadline[1][0] < this.x) {
          this.errr = 1 + this.err;
          this.deadline.splice(1, 1);
          this.sceduler();
          return;
        }
        this.deadline[1][1] = this.deadline[0][1] - 1;
        this.scedule = this.deadline[0];
        this.hour = (this.hour + 1) % 3;
        return;
      }
    } else if (
      this.fixed.length != 0 &&
      this.x >= this.fixed[0][0] &&
      this.x <= this.fixed[0][1]
    ) {
      this.scedule = this.fixed[0];
    } else if (this.fixed.length != 0 && this.x > this.fixed[0][1]) {
      this.fixed.shift();
      this.sceduler();
      return;
    }
  }
}
let u1 = new user("akash", "password");
let users = [];
for (i = 0; i < 10; i++) {
  users.push(new user("akash", "password"));
}
/* GET users listing. */
router.get("/", function(req, res, next) {
  console.log(req.session.user);
  res.send(JSON.stringify(u1));
});

router.post("/", function(req, res, next) {
  if (req.body.start && req.body.end) {
    u1.addfixed(
      new Date(req.body.start),
      new Date(req.body.end),
      req.body.name
    );
  }
  if (req.body.deadline != "" && req.body.hours) {
    u1.adddead(new Date(req.body.deadline), req.body.hours, req.body.name);
  }
  res.send(JSON.stringify(u1));
});

setInterval(function scedule() {
  for (i = 0; i < users.length; i++) {
    users.scedule();
  }
}, 3600000);
module.exports = router;
