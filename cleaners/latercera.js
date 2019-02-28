const $ = require('cheerio')
const rp = require('request-promise')
const async = require('async')
const MongoClient = require('mongodb').MongoClient


const slug = 'latercera'
<<<<<<< HEAD
=======
const date = new Date()
>>>>>>> 0fd8925d9fb98637bf514530737d23b7c86c7e66


MongoClient.connect('mongodb://localhost:27017', (err, client) => {

    if (err) throw err

    var db = client.db('webscraping');

    db.collection('links', (err, collection) => {

        // delete links not containing 'noticia', which are not news articles

        var query = {
            $and: [
                { slug: slug },
                { $or: [
<<<<<<< HEAD
                    { url: { $not: /noticia/} },
=======
                    { url: { not: /noticia/} },
>>>>>>> 0fd8925d9fb98637bf514530737d23b7c86c7e66
                    { url: null }
                ]}
            ]
        }

        collection.deleteMany(query, (err, result) => {

            if (err) throw err

            console.log(result.result.n + ' document(s) deleted');

            // TODO: separate function for logging or logging mixin

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
                        // Call an asynchronous function, often a save() to DB
                        rp(link.url)
                            .then((html) => {
                                console.log(link.url)
                                article = $('.col-article-main', html)
                                collection.updateOne(
                                    { _id: link._id},
                                    {$set:
                                        { article: $(article).text() }
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
<<<<<<< HEAD
                                client.close()
                            })
                        }
=======
                            })
                        }
                        // client.close()
>>>>>>> 0fd8925d9fb98637bf514530737d23b7c86c7e66
                    }
                )

            })

        })

    })
})