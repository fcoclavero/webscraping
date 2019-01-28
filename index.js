const $ = require('cheerio')
const fs = require("fs")
const rp = require('request-promise')
const program = require('commander')
const MongoClient = require('mongodb').MongoClient


program
    .version('0.0.1')
    .option('-s, --slug [slug]', 'Short identifier for the page to be scraped [slug]. Available sites in sites.json')
    .parse(process.argv);


const site = JSON.parse(fs.readFileSync("sites.json")).find(site => {
    return site.slug === program.slug
})

const url = site.url
const slug = site.slug
const lang = site.lang
const date = new Date()
 

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
                        'source': slug,
                        'lang': lang
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