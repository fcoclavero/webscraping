const $ = require('cheerio')
const rp = require('request-promise')
const Article = require('../models/article.model')
const config = require('../config')


module.exports = async function(slug) {
  var articleCount = 0
  const site = config.sites[slug]
  return rp(site.url)
    .then(html => $('a', html).map(function (i, link) {
      return {
        'title': $(link).text(),
        'url': $(link).attr('href'),
        'slug': site.slug,
        'lang': site.lang
      }
    }).get())
    .then(articles => { Article.countDocuments().then(count => articleCount = count); return articles})
    .then(articles => Article.insertMany(articles, { ordered: false }))
    .catch(_ => console.log(`${slug} - duplicates encountered and ignored`))
    .then(_ => Article.countDocuments())
    .then(count => console.log(`${slug} - total documents inserted: ${count - articleCount}`))
}
