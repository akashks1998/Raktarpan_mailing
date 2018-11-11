let express = require("express");
let MongoClient = require("mongodb").MongoClient;
let url = "mongodb://localhost:27017/";
let crypto = require("crypto");
let randomstring = require("randomstring");

let nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kronoskumar252@gmail.com",
    pass: "kronos252"
  }
});

function calcTime(offset) {
  d = new Date();
  utc = d.getTime();
  //  + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * offset));
}
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
    this.reset = 0;
    this.resetcode = "";
    this.str = str;
    this.email = email;
    this.deadline = [];
    this.idfix = 0;
    this.iddead = 0;
    this.scedule = [];
    this.err = 0;
    this.hour = 0;
    this.contributers = [];
    this.contribute = [];
    this.emailNotify = 1;
  }
  load(obj) {
    this.nam = obj.nam;
    this.email = obj.email;
    this.pas = obj.pas;
    this.verify = obj.verify;
    this.reset = obj.reset;
    this.resetcode = obj.resetcode;
    this.str = obj.str;
    this.fixed = obj.fixed;
    this.deadline = obj.deadline;
    this.idfix = obj.idfix;
    this.iddead = obj.iddead;
    this.scedule = obj.scedule;
    this.err = obj.err;
    this.hour = obj.hour;
    this.contributers = obj.contributers;
    this.contribute = obj.contribute;
    this.emailNotify = obj.emailNotify;

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
      this.sceduler(0);
    }
  }
  addContributer(user) {
    this.contributers.push(user);
  }
  removeContributer(user) {
    if (this.contributers.indexOf(user) > -1) {
      this.contributers.splice(this.contributers.indexOf(user), 1);
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
    this.sceduler(0);
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
  resetc(code) {
    this.reset = 1;
    this.resetcode = code;
  }
  sceduler(val) {
    this.x = calcTime("+5.5");
    //console.log(this.x.getHours());

    if (this.x.getHours() < 7) {
      this.scedule = [0, 0, "Sleep", 0];
      return;
    }
    if (
      this.deadline.length != 0 &&
      (this.fixed.length == 0 || this.x < this.fixed[0][0])
    ) {
      if (this.hour < 3 || this.deadline.length < 2) {
        if (this.deadline[0][1] <= 0) {
          this.deadline.shift();
          this.sceduler(val);
          return;
        }
        if (this.deadline[0][0] < this.x) {
          this.errr = 1 + this.err;
          this.deadline.shift();
          this.sceduler(val);
          return;
        }
        this.deadline[0][1] = this.deadline[0][1] - val;
        this.scedule = this.deadline[0];
        this.hour = (this.hour + 1) % 3;
        return;
      } else {
        if (this.deadline[1][1] <= 0) {
          this.deadline.splice(1, 1);
          this.sceduler(val);
          return;
        }
        if (this.deadline[1][0] < this.x) {
          this.errr = 1 + this.err;
          this.deadline.splice(1, 1);
          this.sceduler(val);
          return;
        }
        this.deadline[1][1] = this.deadline[0][1] - val;
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
      this.sceduler(val);
      return;
    } else {
      this.scedule = [0, 0, "Free", 0];
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
          nam: user.nam
          // pas: user.pas
        };
        let newval = {
          $set: JSON.parse(JSON.stringify(user))
        };
        //console.log(user.pas);
        dbo.collection("users").updateOne(query, newval, function (err, res) {
          if (err) throw err;
          //console.log("1 document updated");
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
          pas: pass
        };
        //console.log(query.pas);
        dbo
          .collection("users")
          .find(query)
          .toArray(function (err, result) {
            if (err) throw err;
            // //console.log("Result" + result.length+result[0].nam);
            if (result.length == 1) {
              //console.log("Resolved");
              u1 = new user("temp", "temp");
              u1.load(result[0]);
              resolve("Hi");
            } else {
              //console.log("Unresolved");
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
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function (temp) {
      //console.log("Resolve");
      if (u1.verify == 1) {
        res.redirect("/users/home");
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/change", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function (temp) {
      //console.log("Resolve");
      if (u1.verify == 1) {
        if (req.body.email != null && req.body.email != u1.email) {
          let temp = randomstring.generate(7);
          let mailOptions = {
            from: "kronoskumar252@gmail.com",
            to: req.body.email,
            subject: "Conformation mail by Kronos",
            text: "Conformation code is " + temp
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              //console.log(error);
              res.send("Sorry, server error");
              return;
            } else {
              u1.str = temp;
              u1.email = req.body.email;
              u1.verify = 0;
              updateUser(u1);
              //console.log("Email sent: " + info.response);
            }
          });
        }
        if (req.body.password != "") {
          u1.pas = crypto
            .createHash("md5")
            .update(req.body.password)
            .digest("hex");
          req.session.pass = req.body.password;
          updateUser(u1);
          res.redirect("/");
        } else {
          res.redirect("/");
        }
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.post('/email', function (req, res) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.user, crypto.createHash("md5").update(req.session.pass).digest("hex")).then(function () {
      if (u1.verify == 1) {
        if (req.body.email_check == 1) {
          //console.log("Hiiiiiii");
          u1.emailNotify = 1;
          updateUser(u1);
        } else {
          //console.log("Noooooooo");
          u1.emailNotify = 0;
          updateUser(u1);
        }
        res.redirect("/users/settings");
      } else {
        res.render('verification');
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.get('/home', (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        res.render("home", {
          user: u1,
          value: 0,
          id: ""
        });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/contribute/:id/home", (req, res) => {
  let id = req.params.id;
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: id
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            //console.log(
            //   "Contributers index" + temp.contributers.indexOf(u1.nam)
            // );
            if (temp.contributers.indexOf(u1.nam) > -1) {
              res.render("home", {
                user: temp,
                value: 0,
                id: "contribute/" + id + "/"
              });
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.get("/contribute/:id/home/:val", (req, res) => {
  let id = req.params.id;
  let val = req.params.val;
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: id
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            //console.log(
            //   "Contributers index" + temp.contributers.indexOf(u1.nam)
            // );
            if (temp.contributers.indexOf(u1.nam) > -1) {
              res.render("home", {
                user: temp,
                value: val,
                id: "contribute/" + id + "/"
              });
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/delete/fixed/:id/:val", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let id = req.params.id;
        for (let i = 0; i < u1.fixed.length; i++) {
          if (u1.fixed[i][3] == id) {
            u1.fixed.splice(i, 1);
            u1.sceduler(0);
          }
        }
        updateUser(u1);
        res.redirect("/users/home/" + req.params.val);
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/delete/deadline/:id/:val", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let id = req.params.id;
        for (let i = 0; i < u1.deadline.length; i++) {
          if (u1.deadline[i][3] == id) {
            u1.deadline.splice(i, 1);
            u1.sceduler(0);
          }
        }
        updateUser(u1);
        res.redirect("/users/home/" + req.params.val);
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.get("/contribute/:user/delete/deadline/:id/:val", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: req.params.user
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            //console.log(
            //   "Contributers index" + temp.contributers.indexOf(u1.nam)
            // );
            if (temp.contributers.indexOf(u1.nam) > -1) {
              let id = req.params.id;
              for (let i = 0; i < temp.deadline.length; i++) {
                if (temp.deadline[i][3] == id) {
                  temp.deadline.splice(i, 1);
                  temp.sceduler(0);
                }
              }
              updateUser(temp);
              res.redirect(
                "/users/contribute/" +
                req.params.user +
                "/home/" +
                req.params.val
              );
              // res.render("home", { user: temp, value: val, id:"contribute/"+id+"/"  });
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/contribute/:user/delete/fixed/:id/:val", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: req.params.user
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            //console.log(
            //   "Contributers index" + temp.contributers.indexOf(u1.nam)
            // );
            if (temp.contributers.indexOf(u1.nam) > -1) {
              let id = req.params.id;
              for (let i = 0; i < temp.fixed.length; i++) {
                if (temp.fixed[i][3] == id) {
                  temp.fixed.splice(i, 1);
                  temp.sceduler(0);
                }
              }
              updateUser(temp);
              res.redirect(
                "/users/contribute/" +
                req.params.user +
                "/home/" +
                req.params.val
              );
              // res.render("home", { user: temp, value: val, id:"contribute/"+id+"/"  });
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/home/:val", (req, res) => {
  let value = req.params.val;
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      if (u1.verify == 1) {
        res.render("home", {
          user: u1,
          value: value,
          id: ""
        });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});

router.post("/addcontributer", function (req, res) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      let temp;
      let userexits = new Promise(function (resolve, rej) {
        MongoClient.connect(
          url,
          function (err, db) {
            if (err) throw err;
            let dbo = db.db("users");
            let query = {
              nam: req.body.contributer
            };
            dbo
              .collection("users")
              .find(query)
              .toArray(function (err, result) {
                if (err) throw err;
                //console.log("Result" + result.length);
                if (result.length == 1) {
                  temp = new user("temp", "temp");
                  temp.load(result[0]);
                  resolve(1);
                } else {
                  rej(0);
                }
                db.close();
              });
          }
        );
      });
      userexits
        .then(() => {
          u1.addContributer(req.body.contributer);
          updateUser(u1);
          temp.contribute.push(u1.nam);
          updateUser(temp);
          res.redirect("/users");
        })
        .catch(() => {
          res.send("Sorry, User doesn't exist");
        });
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/contribute", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function () {
      res.render("contribute", {
        contribute: u1.contribute
      });
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.get("/settings", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(() => {
      res.render("settings", {
        user: u1.nam,
        email: u1.email,
        contributer: u1.contributers,
        emailNotification: u1.emailNotify
      });
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/forget", function (req, res) {
  let temp;
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
            //console.log("Result" + result.length);
            if (result.length == 1) {
              temp = new user("temp", "temp");
              temp.load(result[0]);
              resolve(1);
            } else {
              rej(0);
            }
            db.close();
          });
      }
    );
  });
  userexits.then(function () {
    let tmp = randomstring.generate(7);
    let mailOptions = {
      from: "kronoskumar252@gmail.com",
      to: temp.email,
      subject: "Conformation mail by Kronos",
      text: "Conformation code to reset password is " + tmp
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        //console.log(error);
        res.render("/forget");
      } else {
        //console.log("Email sent: " + info.response);
        updateUser(temp);
      }
    });
    temp.resetc(tmp);
    res.redirect("/reset");
  });
});
router.post("/removecontributer", (req, res) => {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
    req.session.user,
    crypto
    .createHash("md5")
    .update(req.session.pass)
    .digest("hex")
  ).then(() => {
    if (u1.verify == 1) {
      u1.removeContributer(req.body.user);
      updateUser(u1);
      let temp;
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
                //console.log("Result" + result.length);
                if (result.length == 1) {
                  temp = new user("temp", "temp");
                  temp.load(result[0]);
                  resolve(1);
                } else {
                  rej(0);
                }
                db.close();
              });
          }
        );
      });
      userexits.then(() => {
        if (temp.contribute.indexOf(u1.nam) > -1) {
          temp.contribute.splice(temp.contribute.indexOf(u1.nam), 1);
          updateUser(temp);
        }
      });
    } else {
      res.redirect("/verification");
    }
  });
});
router.post("/reset", function (req, res) {
  let temp;
  let ps = crypto
    .createHash("md5")
    .update(req.body.pass)
    .digest("hex");
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
            //console.log("Result" + result.length);
            if (result.length == 1) {
              temp = new user("temp", "temp");
              temp.load(result[0]);
              resolve(1);
            } else {
              rej(0);
            }
            db.close();
          });
      }
    );
  });

  userexits
    .then(function () {
      if (temp.reset == 1 && temp.resetcode == req.body.code) {
        let mailOptions = {
          from: "kronoskumar252@gmail.com",
          to: temp.email,
          subject: "Password reset by Kronos",
          text: "Dear " + temp.nam + ",Your password is reset successfully."
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            //console.log(error);
          } else {
            //console.log("Email sent: " + info.response);
          }
        });
        let x = new Promise(function (resolve, rej) {
          temp.pas = ps;
          temp.reset = 0;
          //console.log(
          //   "Password is " +
          //     crypto
          //       .createHash("md5")
          //       .update(req.body.pass)
          //       .digest("hex")
          // );
          resolve();
        });
        x.then(() => {
          updateUser(temp);
          res.redirect("/users");
          return;
        }).catch(() => {
          res.send("Sorry error bro");
        });
      } else {
        res.redirect("/reset");
      }
    })
    .catch(() => {
      res.send("User does not exist or some server side error");
    });
});

router.post("/contributer/:id/deadline", function (req, res, next) {
  let id = req.params.id;
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function (tem) {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: id
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            //console.log(
            //   "Contributers index" + temp.contributers.indexOf(u1.nam)
            // );
            if (temp.contributers.indexOf(u1.nam) > -1) {
              if (req.body.deadline != "" && req.body.hours) {
                temp.adddead(
                  new Date(req.body.deadline),
                  req.body.hours,
                  req.body.name
                );
                updateUser(temp)
                  .then(function () {
                    let mailOptions = {
                      from: "kronoskumar252@gmail.com",
                      to: temp.email,
                      subject: "New task added",
                      text: "User " +
                        u1.nam +
                        " added a task in your calender. The task is " +
                        req.body.name
                    };
                    if (temp.emailNotify == 1) {
                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          //console.log(error);
                        } else {
                          //console.log("Email sent: " + info.response);
                        }
                      });
                    }
                    res.redirect("/users/contribute/" + temp.nam + "/home");
                  })
                  .catch(function () {
                    //console.log("Sorry");
                  });
              }
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/contributer/:id/fixed", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  let id = req.params.id;

  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function (tem) {
      if (u1.verify == 1) {
        let temp;
        let sour = new Promise(function (resolve, reject) {
          MongoClient.connect(
            url,
            function (err, db) {
              if (err) throw err;
              let dbo = db.db("users");
              let query = {
                nam: id
              };
              dbo
                .collection("users")
                .find(query)
                .toArray(function (err, result) {
                  if (err) throw err;
                  //console.log("Result" + result.length);
                  //console.log(result);
                  if (result.length != 0) {
                    //console.log("Resolved");
                    temp = new user("temp", "temp");
                    temp.load(result[0]);
                    resolve("Hi");
                  } else {
                    //console.log("Unresolved");
                    reject(0);
                  }

                  db.close();
                });
            }
          );
        });
        sour
          .then(function () {
            temp.contributers.indexOf(u1.nam);
            if (temp.contributers.indexOf(u1.nam) > -1) {
              if (req.body.start != null && req.body.end != null) {
                temp.addfixed(
                  new Date(req.body.start),
                  new Date(req.body.end),
                  req.body.name
                );
                updateUser(temp)
                  .then(function () {
                    let mailOptions = {
                      from: "kronoskumar252@gmail.com",
                      to: temp.email,
                      subject: "New task added",
                      text: "User " +
                        u1.nam +
                        " added a task in your calender. The task is " +
                        req.body.name
                    };
                    if (temp.emailNotify == 1) {
                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          //console.log(error);
                        } else {
                          //console.log("Email sent: " + info.response);
                        }
                      });
                    }
                    res.redirect("/users/contribute/" + temp.nam + "/home");
                  }).catch(function () {
                    //console.log("Sorry");
                  });
              }
            } else {
              res.send("Sorry, but you are not a contributer");
            }
          })
          .catch(function () {
            res.send("Sorry, some server side error");
          });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
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
          u1.adddead(
            new Date(req.body.deadline),
            req.body.hours,
            req.body.name
          );
        }
        updateUser(u1).then(function () {
          res.redirect("/users/home");
        });
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
      res.render("index");
      return;
    });
});
router.post("/verify", function (req, res, next) {
  if (req.session.user == undefined || req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(
      req.session.user,
      crypto
      .createHash("md5")
      .update(req.session.pass)
      .digest("hex")
    )
    .then(function (temp) {
      //console.log("Resolve");
      if (u1.str == req.body.code && u1.verify == 0) {
        u1.verify = 1;
        updateUser(u1);
        res.redirect("/users");
      } else {
        res.render("verification");
      }
    })
    .catch(function () {
      //console.log("Unresolved");
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
            //console.log("Result" + result.length);
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
          let temp = randomstring.generate(7);
          u1 = new user(req.body.user, req.body.pass, req.body.email, 0, temp);
          let mailOptions = {
            from: "kronoskumar252@gmail.com",
            to: req.body.email,
            subject: "Conformation mail by Kronos",
            text: "Conformation code is " + temp
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              //console.log(error);
            } else {
              //console.log("Email sent: " + info.response);
            }
          });

          //console.log(JSON.stringify(u1));
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
            //console.log("Result " + result.length);
            for (i = 0; i < result.length; i++) {
              let temp = new user("temp", "temp");
              temp.load(result[i]);
              temp.sceduler(1);
              updateUser(temp)
                .then(function () {
                  let mailOptions = {
                    from: "kronoskumar252@gmail.com",
                    to: temp.email,
                    subject: "Scheduler",
                    text: "Current task is " + temp.scedule[2]
                  };
                  if (u1.emailNotify == 1) {
                    transporter.sendMail(mailOptions, function (error, info) {
                      if (error) {
                        //console.log(error);
                      } else {
                        //console.log("Email sent: " + info.response);
                      }
                    });
                  }
                }).catch(function () {
                  //console.log("Sorry");
                });
            }
          });
        db.close();
      }
    );
  });
}, 3600000);
module.exports = router;