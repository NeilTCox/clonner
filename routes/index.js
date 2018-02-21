var express = require('express');
var router = express.Router();
var usersModel = require('../models/users');
var postsModel = require('../models/posts');
var io = require('../io');
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (typeof req.user !== 'undefined') {
    postsModel.find(function(err, posts) {
      if (err) {
        return res.send(err);
      } else if (posts) {
        usersModel.find(function(err, users) {
          usersModel.findOne({
            _id: req.user._id
          }, function(err, user) {
            res.render('index', {
              loggedIn: true,
              postList: posts,
              userList: users,
              loggedUser: user
            });
          });
        });
      } else {
        next(err);
      }
    });
  } else {
    res.render('landing');
  }
});



module.exports = router;