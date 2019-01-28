const $ = require('cheerio')
const rp = require('request-promise')
const MongoClient = require('mongodb').MongoClient


const date = new Date()
const url = 'https://www.latercera.com'
const slug = 'latercera'


rp(url)
    .then(function (html) {

        links = $('a', html) // cheerio get all hyperlinks

        // connect to the db
        MongoClient.connect("mongodb://localhost:27017", (err, client) => {
        
            if (err) throw err

            var db = client.db('webscraping');

            db.collection('links', function (err, collection) {
        
                // get link text and href and save to db
                $(links).each(function(i, link){
                    collection.insertOne({
                        'text': $(link).text(),
                        'link': $(link).attr('href'),
                        'date': date,
                        'source': slug
                    })
                })
                
                db.collection('links').countDocuments(function (err, count) {
                    if (err) throw err;
                    console.log('Total Rows: ' + count);
                })
            })

            client.close()
        })
    })
    .catch(function (err) {
        throw err
    })