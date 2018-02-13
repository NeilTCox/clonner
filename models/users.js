var mongoose = require('mongoose');

var schema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  following: [String]
});

module.exports = mongoose.model('users', schema);