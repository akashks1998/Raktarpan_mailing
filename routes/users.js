let express = require("express");
let MongoClient = require("mongodb").MongoClient;
let url = "mongodb://localhost:27017/";
let crypto = require("crypto");
let randomstring = require("randomstring");

let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'akashkumarsingh214@gmail.com',
    pass: 'akashkumarsingh31'
  }
});



let router = express.Router();
class user {
  constructor(nam, pas, email, verify, str) {

    this.nam = nam;
    this.pas = crypto
      .createHash("md5")
      .update(pas)
      .digest("hex");
    this.fixed = [];
    this.verify = verify;
    this.str = str;
    this.email = email;
    this.deadline = [];
    this.idfix = 0;
    this.iddead = 0;
    this.scedule = [];
    this.err = 0;
    this.hour = 0;
  }
  load(obj) {
    this.nam = obj.nam;
    this.email = obj.email;
    this.pas = obj.pas;
    this.verify = obj.verify;
    this.str = obj.str;
    this.fixed = obj.fixed;
    this.deadline = obj.deadline;
    this.idfix = obj.idfix;
    this.iddead = obj.iddead;
    this.scedule = obj.scedule;
    this.err = obj.err;
    this.hour = obj.hour;
  }
  addfixed(start, end, name) {
    if (start > end) {
      this.err = this.err + 1;
      return;
    } else {
      this.fixed.forEach(element => {
        if (element[0] < end && element[1] > start) {
          this.err = this.err + 1;
          return;
        }
      });
      this.fixed.push([start, end, name, this.idfix]);
      this.fixed.sort(function (a, b) {
        return a[0] > b[0] ? 1 : -1;
      });
      this.idfix = this.idfix + 1;
      this.sceduler();
    }
  }

  adddead(deadline, hour, name) {
    if (hour < 0) {
      this.err++;
      return;
    }
    this.deadline.push([deadline, hour, name, this.iddead]);
    this.deadline.sort(function (a, b) {
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

function updateUser(user) {
  return new Promise(function (resolve, rej) {
    MongoClient.connect(
      url,
      function (err, db) {
        if (err) throw err;
        let dbo = db.db("users");
        let query = {
          nam: user.nam,
          pas: user.pas
        };
        let newval = {
          $set: JSON.parse(JSON.stringify(user))
        };
        console.log(query.pas);
        dbo.collection("users").updateOne(query, newval, function (err, res) {
          if (err) throw err;
          console.log("1 document updated");
        });
        resolve("Hi");
        db.close();

      }

    );
  });
}

function checkLogin(userName, pass) {
  return new Promise(function (resolve, reject) {
    MongoClient.connect(
      url,
      function (err, db) {
        if (err) throw err;
        let dbo = db.db("users");
        let query = {
          nam: userName,
          pas: crypto
            .createHash("md5")
            .update(pass)
            .digest("hex")
        };
        console.log(query.pas);
        dbo
          .collection("users")
          .find(query)
          .toArray(function (err, result) {
            if (err) throw err;
            console.log("Result" + result.length);
            console.log(result);
            if (result.length != 0) {
              console.log("Resolved");
              u1 = new user("temp", "temp");
              u1.load(result[0]);
              resolve("Hi");
            } else {
              console.log("Unresolved");
              reject(0);
            }

            db.close();
          });
      }
    );
  });
}
let u1;
/* GET users listing. */
router.get("/", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.user, req.session.pass)
    .then(function (temp) {
      console.log("Resolve");
      if (u1.verify == 1) {
        res.send(JSON.stringify(u1));
      } else {
        res.render('verification');
      }
    })
    .catch(function () {
      console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.post("/", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.user, req.session.pass)
    .then(function (temp) {
      if (u1.verify == 1) {
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
        updateUser(u1).then(function () {
          res.send(JSON.stringify(u1));
        });

      } else {
        res.render('verification');
      }
    })
    .catch(function () {
      console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post('/verify',function(req,res,next){
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.user, req.session.pass)
    .then(function (temp) {
      console.log("Resolve");
      if (u1.str == req.body.code&& u1.verify==0) {
        u1.verify=1;
        updateUser(u1);
        res.redirect("/users");
      } else {
        res.render('verification');
      }
    })
    .catch(function () {
      console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/signup", function (req, res, next) {
  //In this we are assigning email to sess.email letiable.
  //email comes from HTML page.
  let userexits = new Promise(function (resolve, rej) {
    MongoClient.connect(
      url,
      function (err, db) {
        if (err) throw err;
        let dbo = db.db("users");
        let query = {
          nam: req.body.user
        };
        dbo
          .collection("users")
          .find(query)
          .toArray(function (err, result) {
            if (err) throw err;
            console.log("Result" + result.length);
            if (result.length != 0) {
              rej(1);
            } else {
              resolve(0);
            }
            db.close();
          });
      }
    );
  });

  userexits
    .then(function () {
      MongoClient.connect(
        url,
        function (err, db) {
          if (err) throw err;
          let dbo = db.db("users");
          let temp=randomstring.generate(7);
          u1 = new user(req.body.user, req.body.pass, req.body.email,0,temp);
          let mailOptions = {
            from: 'akashkumarsingh214@gmail.com',
            to: req.body.email,
            subject: 'Conformation mail by Kronos',
            text: 'Conformation code is ' + temp
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          console.log(JSON.stringify(u1));
          dbo.collection("users").insertOne(JSON.parse(JSON.stringify(u1)));
          if (err) throw err;
        }
      );

      sess = req.session;
      sess.pass = req.body.pass;
      sess.user = req.body.user;
      res.redirect("/users");
    })
    .catch(function () {
      res.redirect("/signup");
    });
});
setInterval(function () {
  let update = new Promise(function (resolve, reject) {
    MongoClient.connect(
      url,
      function (err, db) {
        if (err) throw err;
        let dbo = db.db("users");

        dbo
          .collection("users")
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            console.log("Result " + result.length);
            for (i = 0; i < result.length; i++) {
              let temp = new user("temp", "temp");
              temp.load(result[i]);
              temp.sceduler();
              updateUser(temp).then(
                function () {
                  let mailOptions = {
                    from: 'akashkumarsingh214@gmail.com',
                    to: temp.email,
                    subject: 'Scheduler',
                    text: 'Current task is ' + temp.scedule[2]
                  };

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                }
              ).catch(function () {
                console.log("Sorry");
              });
            }
          });
        db.close();

      });
  });
}, 3600000);
module.exports = router;