const mongoose = require('mongoose')


var ArticleSchema = new mongoose.Schema({
  text: String,
  url: { type: String, unique: true },
  slug: String,
  lang: String,
  article: String
}, {
  timestamps: true
})

module.exports = mongoose.model('article', ArticleSchema)
