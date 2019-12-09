const program = require('commander')
const mongoose = require('../mongoose')


program
  .version('0.0.1')
  .requiredOption('-s, --slug [slug]', 'Short identifier for the page to be scraped [slug]. Available sites in sites.json')
  .parse(process.argv)


var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.on('open', function () {
  require('./scrape')(program.slug).then(_ => mongoose.disconnect())
})
