var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var salt = 10;

var schema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  following: [String]
});

schema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

schema.statics.hashPassword = function(password) {
  return bcrypt.hashSync(password, salt);
};

module.exports = mongoose.model('users', schema);