var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mysession = require('./config');
var mongoose = require('mongoose');
var session = require('client-sessions');

var index = require('./routes/index');
var user = require('./routes/user');
var post = require('./routes/post');

var usersModel = require('./models/users');

var app = express();

mongoose.connect('mongodb://localhost/clonner');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('CONNECTED TO MONGODB');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(mysession));

app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    usersModel.findOne({
      username: req.session.user.username
    }, function(err, this_user) {
      if (this_user) {
        req.user = this_user.toObject();
        delete req.user.password; // delete the password from the session
        req.session.user = this_user; //refresh the session value
        res.locals.user = this_user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use('/', index);
app.use('/user', user);
app.use('/post', post);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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