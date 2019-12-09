const mongoose = require('mongoose')


var ArticleSchema = new mongoose.Schema({
  title: String,
  url: { type: String, unique: true },
  slug: String,
  lang: String,
  content: Object
}, {
  timestamps: true
})

module.exports = mongoose.model('article', ArticleSchema)
