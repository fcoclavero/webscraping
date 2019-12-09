const program = require('commander')
const config = require('./config')
const mongoose = require('./mongoose')
const scrape_articles = require('./scrape_articles/scrape')
const scrape_homepage = require('./scrape_homepage/scrape')


program
  .version('0.0.1')


var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.on('open', function () {
  Promise.all(Object.keys(config.sites).map((key, index) => {
    var slug = config.sites[key].slug
    return scrape_homepage(slug).then(_ => scrape_articles(slug))
  })).then(_ => mongoose.disconnect())
})
