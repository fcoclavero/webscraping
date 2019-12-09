const rp = require('request-promise')
const Article = require('../models/article.model')
const config = require('../config')


module.exports = async function(slug) {
  const site = config.sites[slug]
  return Article.deleteMany({ $and: [{ slug: slug }, { $or: [ { url: { $not: { $regex: site.articleUrlRegex }} }, { url: null }]}]})
    .then(queryResult => console.log(`${slug} - ${queryResult.deletedCount} document(s) not containing the site's article url regex deleted`))
    .then(_ => Article.find({ slug: slug, content: { $exists: false }}))
    .then(articles => { console.log(`${slug} - ${articles.length} article text(s) to be fetched`); return articles })
    .then(articles => Promise.all(articles.map(article => {
      var url = RegExp(site.url).test(article.url) ? article.url : site.url + article.url
      return rp(url)
        .catch(_ => console.log(`${slug} - request error for url ${url}`))
        .then(html => { console.log(`${slug} - fetching ${url}`); return html })
        .then(html => site.extractContent(html))
        .then(content => Article.updateOne({ _id: article._id}, { content: content }))
        .catch(_ => console.log(`${slug} - duplicate url ${url}`))
    })))
}
