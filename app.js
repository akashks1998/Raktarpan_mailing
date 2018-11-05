var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
let sess;

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/mydb";
let id = 0;
MongoClient.connect(
  url,
  function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
  }
);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post('/login',function(req,res){
  sess = req.session;
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
  sess.pass=req.body.pass;
  sess.user=req.body.user;
  res.redirect('/users');
});
app.post('/logout',function(req,res){
  req.session.destroy();
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
  res.redirect('/users');
});
app.get('/logout',function(req,res){
  req.session.destroy();
//In this we are assigning email to sess.email variable.
//email comes from HTML page.
  res.redirect('/index');
});
app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
