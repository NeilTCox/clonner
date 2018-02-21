var session = require('client-sessions');
var cookieParser = require('cookie');
var mysession = require('./config');
var usersModel = require('./models/users');

var io = null;
var this_socket = null;

module.exports = {
  init: function(server) {
    io = require('socket.io')(server);

    io.on('connection', function(socket) {
      this_socket = socket;
      var cookie = socket.request.headers.cookie;
      cookie = cookieParser.parse(cookie);
      cookie = session.util.decode(mysession, cookie.session);

      if (cookie) {
        usersModel.findOne({
          'username': cookie.content.user.username
        }, function(err, user) {
          if (err) {
            console.error(err);
          } else {
            for (var i = 0; i < user.following.length; i++) {
              socket.join(user.following[i]);
            }
          }
        });
      }
    });
  },
  instance: function() {
    return io;
  },
  socket: function() {
    return this_socket;
  }
};