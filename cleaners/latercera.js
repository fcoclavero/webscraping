const $ = require('cheerio')
const rp = require('request-promise')
const async = require('async')
const MongoClient = require('mongodb').MongoClient


const slug = 'latercera'
const date = new Date()


MongoClient.connect("mongodb://localhost:27017", (err, client) => {

    if (err) throw err

    var db = client.db('webscraping');

    db.collection('links', (err, collection) => {

        // delete links not containing 'noticia', which are not news articles

        var query = {
            $and: [
                { slug: slug },
                { $or: [
                    { url: { not: /noticia/} },
                    { url: null }
                ]}
            ]
        }

        collection.deleteMany(query, (err, result) => {

            if (err) throw err

            console.log(result.result.n + " document(s) deleted");

            // delete duplicate urls. I've set url as unique key, so this shouldn't happen

            collection.find({ slug: slug }, { url: 1 }).sort({ _id: 1 }).forEach( (doc) => {
                // we sort by id (inc), then for each doc delete all documents with the same url but greater id
                collection.deleteMany(
                    { _id: { $gt: doc._id },
                    url: doc.url
                })
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
                        // Call an asynchronous function, often a save() to DB
                        console.log(link.url)
                        rp(link.url)
                            .then((html) => {
                                article = $('.col-article-main', html)
                                console.log($(article).text())
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
                            console.log('All files have been processed successfully')
                        }
                        client.close()
                    }
                )

            })

        })

    })
})