var express = require('express');
var router = express.Router();
var usersModel = require('../models/users');
var postsModel = require('../models/posts');
var io = require('../io');
var bcrypt = require('bcrypt');

router.post('/join', function(req, res) {
  var newUser = new usersModel({
    username: req.body.join_username,
    password: usersModel.hashPassword(req.body.join_password)
  });
  newUser.save(function(err, user) {
    if (err) {
      res.redirect('/');
      return console.error(err);
    } else {
      res.redirect('/');
    }
  });
});

router.post('/login', function(req, res) {
  usersModel.findOne({
    'username': req.body.login_username
  }, function(err, user) {
    if (err) {
      console.error(err);
      console.log('THERE HAS BEEN AN ERROR. USER NOT IN DB?');
      res.status(500).send(err);
    } else if (user) {
      user.checkPassword(req.body.login_password).then(function(result) {
        if (result) {
          req.session.user = user;
        }
        res.redirect('/');
      }).catch(function(err) {
        console.log('errored checkPassword');
        console.error(err);
        res.status(500).send(err);
      });
    } else {
      res.redirect('/');
    }
  });
});

router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

router.post('/:username/follow', function(req, res) {
  usersModel.findOne({
    _id: req.user._id
  }, function(err, user) {
    if (user.following.includes(req.params.username)) {
      usersModel.findOneAndUpdate({
        _id: req.user._id
      }, {
        $pullAll: {
          following: [req.params.username]
        }
      }, function(err) {
        if (err) {
          console.error(err);
        }
      });
      io.socket().leave(req.params.username);
      res.send(false);
    } else {
      usersModel.findOneAndUpdate({
        _id: req.user._id
      }, {
        $push: {
          following: req.params.username
        }
      }, function(err) {
        if (err) {
          console.error(err);
        }
      });
      io.socket().join(req.params.username);
      res.send(true);
    }
  });
});

module.exports = router;