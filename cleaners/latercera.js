const MongoClient = require('mongodb').MongoClient


MongoClient.connect("mongodb://localhost:27017", (err, client) => {

    if (err) throw err

    var db = client.db('webscraping');

    db.collection('links', function (err, collection) {

        var query = { source: 'latercera', link: {$not : /noticia/} } // links not containing 'noticia' are not news articles

        db.collection('links').deleteMany(query, function (err, result) {
            if (err) throw err
            console.log(result.result.n + " document(s) deleted");
            client.close()
        })

    })
})
