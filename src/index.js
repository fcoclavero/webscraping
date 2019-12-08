const program = require('commander')
const Article = require('./models/article.model')
const config = require('./config')
const mongoose = require('./mongoose')


program
  .version('0.0.1')


var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))

db.on('open', function () {
  console.log(`MongoDB connected at: ${config.connectionUrl}`)
  article = Article({ text: 'test' })
  article.save()
    .then(function (article) {
      console.log(`saved article: ${article}`)
      return Article.find()
    })
    .then(function (articles) {
      console.log(`found articles: ${articles}`);
    })
    .then(function () {
      mongoose.disconnect()
    })
})
