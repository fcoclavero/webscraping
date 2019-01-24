const $ = require('cheerio');
const rp = require('request-promise');
const fs = require('fs');

const url = 'https://www.latercera.com';
const slug = 'latercera'
const date = new Date()


rp(url)
    .then(function(html){
        // success!
        
        // get all news links
        links = $('a', html); // cheerio get all hyperlinks
        
        var stream = fs.createWriteStream(`data/json/${slug}.json`);

        // get link text and href and save to file
        stream.once('open', function(fd) {
            $(links).each(function(i, link){
                stream.write(JSON.stringify({
                    'text': $(link).text(),
                    'link': $(link).attr('href'),
                    'date': date,
                    'source': url
                }))
            });
            stream.end();
        });
    })
    .catch(function(err){
        // handle error
        console.log(err)
    });