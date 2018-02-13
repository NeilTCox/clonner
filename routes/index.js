var express = require('express');
var router = express.Router();
var usersModel = require('../models/users');
var postsModel = require('../models/posts');
var io = require('../io');

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

router.post('/join', function(req, res) {
  var newUser = new usersModel({
    username: req.body.join_username,
    password: req.body.join_password
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
    } else if (user.password == req.body.login_password) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  });
});

router.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

router.post('/post', function(req, res) {
  var newPost = new postsModel({
    author_username: req.user.username,
    main_content: req.body.post_content
  });
  newPost.save(function(err, post) {
    if (err) {
      return console.error(err);
    }
    // else {
    //   res.send(newPost);
    // }
    io.instance().to(req.user.username).emit('newPost', {
      data: post.toObject()
    });
    res.end();
  });
  // .then(function(post) {
  //   console.log('hitting post socket send');
  //   io.instance().to(req.user.username).emit('newPost', {
  //     data: post.toObject()
  //   });
  //   res.status(201).json(post);
  // }).catch(function(err) {
  //   res.status(500).send(err);
  // });
});

router.post('/follow/:username', function(req, res) {
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
      socket.leave(req.params.username);
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
      socket.join(req.params.username);
      res.send(true);
    }
  });
});

module.exports = router;