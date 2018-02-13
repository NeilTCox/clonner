var mongoose = require('mongoose');

var schema = mongoose.Schema({
  author_username: String,
  main_content: String
});

module.exports = mongoose.model('posts', schema);