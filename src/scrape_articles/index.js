const $ = require('cheerio')
const rp = require('request-promise')
const program = require('commander')
const Article = require('../models/article.model')
const config = require('../config')
const mongoose = require('../mongoose')


module.exports = function(slug) {
  var db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.on('open', async function () {
  const site = config.sites[slug]
  Article.countDocuments().then(count => console.log(`Article count: ${count}`))
  Article.deleteMany({ $and: [{ slug: slug }, { $or: [ { url: { $not: { $regex: site.articleUrlRegex }} }, { url: null }]}]})
    .then(queryResult => console.log(`${slug} - ${queryResult.deletedCount} document(s) not containing the site's article url regex deleted`))
    .then(_ => Article.find({ slug: slug, article: { $exists: false }}))
    .then(articles => { console.log(`${articles.length} article text(s) to be fetched`); return articles })
    .then(articles => articles.forEach(article => {
      var url = RegExp(site.url).test(article.url) ? article.url : site.url + article.url
      rp(url)
        .then(html => { console.log(`Fetching ${url}`); return html })
        .then(html => $(site.articleHtmlClass, html))
        .then(articleText => Article.updateOne({ _id: article._id}, {$set: { article: $(articleText).text(), url: url }}))
    }))
    .then(_ => mongoose.disconnect())
  })
}


program
  .version('0.0.1')
  .requiredOption('-s, --slug [slug]', 'Short identifier for the page to be scraped [slug]. Available sites in sites.json')
  .parse(process.argv)
  .action(module.exports(program.slug))
