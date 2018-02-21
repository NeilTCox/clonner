var express = require('express');
var router = express.Router();
var usersModel = require('../models/users');
var postsModel = require('../models/posts');
var io = require('../io');
var bcrypt = require('bcrypt');

router.post('/', function(req, res) {
  var newPost = new postsModel({
    author_username: req.user.username,
    main_content: req.body.post_content
  });
  newPost.save(function(err, post) {
    if (err) {
      return console.error(err);
    }
    io.instance().to(req.user.username).emit('newPost', {
      data: newPost
    });
    res.send(newPost);
  });
});

module.exports = router;