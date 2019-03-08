const $ = require('cheerio')
const fs = require("fs")
const MongoClient = require('mongodb').MongoClient


const slug = 'cmf'
const lang = 'es'
const html = fs.readFileSync('./static/cmf.html', 'utf8')


const regex = new RegExp('\/documentos\/hes\/hes_[0-9]*.pdf', 'g');

const links = $('a', html).filter(function (index, element) { // solo hechos escenciales
    // this === element
    return $(this).attr('href').match(regex)
})

// connect to the db
MongoClient.connect('mongodb://localhost:27017', (err, client) => {

    if (err) throw err

    var db = client.db('webscraping');

    db.collection('cmf', (err, collection) => {

        var countBefore = 0

        collection.countDocuments((err, count) => {
            if (err) throw err
            countBefore = count
        })

        // get link text and href and save to db

        $(links).each((i, link) => {
            collection.insertOne({
                'doc_id': $(link).text().trim(),
                'url': $(link).attr('href'),
                'date': $(link).parent().prev().text(),
                'slug': slug,
                'lang': lang,
                'entity': $(links[0]).parent().next().text(),
                'subject': $(links[0]).parent().next().next().text()
            })
        })

        collection.countDocuments((err, count) => {
            if (err) throw err
            console.log('Total documents inserted: ' + (count - countBefore))
        })
    })

    client.close()
})
