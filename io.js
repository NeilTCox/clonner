var session = require('client-sessions');
var cookieParser = require('cookie');
var mysession = require('./config');

var io = null;

module.exports = {
  init: function(server) {
    io = require('socket.io')(server);

    io.on('connection', function(socket) {
      var cookie = socket.request.headers.cookie;
      cookie = cookieParser.parse(cookie);
      cookie = session.util.decode(mysession, cookie.session);


    });
  },
  instance: function() {
    return io;
  }
};