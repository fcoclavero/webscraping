const $ = require('cheerio')
const async = require('async')
const fs = require("fs")
const rp = require('request-promise')
const program = require('commander')
const MongoClient = require('mongodb').MongoClient


program
    .version('0.0.1')
    .option('-s, --slug [slug]', 'Short identifier for the page to be scraped [slug]. Available sites in sites.json')
    .parse(process.argv);


const site = JSON.parse(fs.readFileSync('sites.json')).find(site => {
    return site.slug === program.slug
})


const slug = site.slug
const articleUrlRegex = new RegExp(site.articleUrlRegex);
const articleHtmlClass = site.articleHtmlClass


MongoClient.connect('mongodb://localhost:27017', (err, client) => {

    if (err) throw err

    var db = client.db('webscraping');

    db.collection('links', (err, collection) => {

        // delete links not containing 'noticia', which are not news articles

        var query = {
            $and: [
                { slug: slug },
                { $or: [
                    { url: { $not: articleUrlRegex} },
                    { url: null }
                ]}
            ]
        }

        collection.deleteMany(query, (err, result) => {

            if (err) throw err

            console.log(result.result.n + ' document(s) deleted');

            var countBefore = 0

            collection.countDocuments((err, count) => { // logging
                if (err) throw err
                countBefore = count
            })

            // delete duplicate urls. I've set url as unique key, so this shouldn't happen

            collection.find({ slug: slug }, { url: 1 }).sort({ _id: 1 }).forEach( (doc) => {
                // we sort by id (inc), then for each doc delete all documents with the same url but greater id
                collection.deleteMany(
                    { _id: { $gt: doc._id },
                    url: doc.url
                })
            })

            collection.countDocuments((err, count) => { // logging
                if (err) throw err
                console.log(Math.abs(count - countBefore) + ' duplicate(s) deleted')
                countBefore = count
            })

            // get missing article text. The code is placed here so it runs after the delete

            var query = {
                slug: slug,
                article: {
                    $exists: false
                }
            }

            links = collection.find(query).toArray((err, links) => {

                if (err) throw err

                async.each(links, (link, callback) => {
                        // Update url if it does not begin with the site url
                        var url = RegExp(site.url).test(link.url) ? link.url : site.url + link.url
                        // Call an asynchronous function, often a save() to DB
                        rp(url)
                            .then((html) => {
                                console.log(link.url)
                                article = $(articleHtmlClass, html)
                                collection.updateOne(
                                    { _id: link._id},
                                    {$set:
                                        { article: $(article).text(), url: url }
                                    }
                                )
                                // Async call is done, alert via callback
                                callback();
                            })
                            .catch((err) => {
                                callback(err)
                            })
                    },
                    // 3rd param is the function to call when everything's done
                    (err) => {
                        // All tasks are done now
                        if (err) {
                            // One of the iterations produced an error
                            console.log('A file failed to process')
                            throw err
                        } else {
                            collection.countDocuments((err, count) => { // logging
                                if (err) throw err
                                console.log((count - countBefore) + ' article(s) added')
                                client.close()
                            })
                        }
                    }
                )

            })

        })

    })
})