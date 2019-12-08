const $ = require('cheerio')
const rp = require('request-promise')
const program = require('commander')
const Article = require('../models/article.model')
const config = require('../config')
const mongoose = require('../mongoose')


module.exports = function(slug) {
  var articleCount = 0
  var db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.on('open', async function () {
    const site = config.sites[slug]
    return rp(site.url)
      .then(html => $('a', html).map(function (i, link) {
        return {
          'text': $(link).text(),
          'url': $(link).attr('href'),
          'slug': site.slug,
          'lang': site.lang
        }
      }).get())
      .then(articles => { Article.countDocuments().then(count => articleCount = count); return articles})
      .then(articles => Article.insertMany(articles, { ordered: false }))
      .catch(_ => console.log('Duplicates encountered and ignored.'))
      .then(_ => Article.countDocuments())
      .then(count => console.log(`${slug} - total documents inserted: ${count - articleCount}`))
      .then(_ => mongoose.disconnect())
  })
}


program
  .version('0.0.1')
  .requiredOption('-s, --slug [slug]', 'Short identifier for the page to be scraped [slug]. Available sites in sites.json')
  .parse(process.argv)
  .action(module.exports(program.slug))
