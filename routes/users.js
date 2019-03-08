let express = require("express");
let nodemailer = require("nodemailer");
mailpass=process.env.emailpass;
email=process.env.email;
passwd=process.env.pass;
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: mailpass
  }
});


let router = express.Router();

function checkLogin(pass) {
  return new Promise(function (resolve, reject) {
   if (pass==passwd){
    resolve();
   }else{
    reject();
   }
  });
}
/* GET users listing. */
router.get("/", function (req, res) {
  if (req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.pass)
    .then(function () {
      res.render("home");
    })
    .catch(function () {
      res.render("index");
      return;
    });
});
router.post("/send",(req,res)=>{
  if ( req.session.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.session.pass)
    .then(function () {
      let mailOptions = {
        from: email,
        to: req.body.email,
        subject: "Congrats",
        text: "We are glad to inform you that your blood has saved 1 life. It is used to treat a patient with "+req.body.disease
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.send("Sorry, server error");
          return;
        } else {
          res.render("sent");
        }
      });
    }).catch(function () {
      res.render("index");
      return;
    });
  
});     
module.exports = router;