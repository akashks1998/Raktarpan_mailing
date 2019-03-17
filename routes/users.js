let express = require("express");
let nodemailer = require("nodemailer");
const crypto = require('crypto');
const secret = 'abcdefg';
mailpass=process.env.emailpass;
email=process.env.email;
passwd=process.env.pass;
const hash = crypto.createHmac('sha256', secret)
                   .update(passwd)
                   .digest('hex');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: email,
        pass: mailpass
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});


let router = express.Router();

function checkLogin(pass) {
  return new Promise(function (resolve, reject) {
   if (pass==hash){
    resolve();
   }else{
    reject();
   }
  });
}
/* GET users listing. */
router.get("/", function (req, res) {
  if (req.cookies.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.cookies.pass)
    .then(function () {
      res.render("home");
    })
    .catch(function () {
      res.render("index");
      return;
    });
});
router.post("/send",(req,res)=>{
  if ( req.cookies.pass == undefined) {
    res.render("index");
    return;
  }
  checkLogin(req.cookies.pass)
    .then(function () {
      let mailOptions = {
        from: email,
        to: req.body.email,
        subject: "YOU ARE A HERO",
        text: `Hello
Greetings from  Raktarpan.!.
We are very grateful to inform you that the blood you donated has saved one patient with `+req.body.disease +`. You have played your part in saving a live. Insofar, you deserve a big hand. Society needs more folks like you.
We will appreciate if you continue to donate in future camps also.
Thanks again for supporting this cause and for your contribution to it. 
--
Regards,
Team Raktarpan
        `};
    
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.send("Sorry, server error"+error);
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