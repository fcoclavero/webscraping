const fs = require('fs')
const mongoose = require('mongoose')
const pLimit = require('p-limit');
const program = require('commander')
const rp = require('request-promise')
const tmp = require('temporary-directory')

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const writeFile = util.promisify(fs.writeFile)


program
    .version('0.0.1')
    .option('-p, --parallel-tasks [parallelTasks]', 'Maximum number of parallel scraping tasks. 5 seems like a sweet spot on a PC.')
    .parse(process.argv);


// Maximum concurrency of simultaneous promises at once, too straining otherwise

const limit = pLimit(program.parallelTasks);


async function pdf2img(path) {
    const name = path.split('.')[0]
    const {stdout, stderr} = await exec(`magick -verbose -density 150 ${name}.pdf -quality 100 ${name}.jpg`)
    console.log(stdout)
    console.log(stderr)
}


async function img2txt(path) {
    const name = path.split('.')[0]
    const {stdout, stderr} = await exec(`tesseract ${name}.jpg ${name} -l spa`)
    console.log(stdout)
    console.log(stderr)
}


async function retrieveDocument(cmf) {
    // Create a temporary directory to work on
    tmp(function created (err, dir, cleanup) {
        if (err) console.error('Error creating tmpdir!', err)
        // Get the pdf file from the url using request-promise
        rp({
            uri: cmf.url,
            method: "GET",
            encoding: null,
            headers: {
                "Content-type": "applcation/pdf"
            }
        })
        // and save it temporarily in the file system
        .then(document => writeFile(dir + '/tmp.pdf', document, 'binary'))
        // Tesseract OCR (optical character recognition) accepts only images,
        // so we must convert the temporary files, using ImageMagick.
        .then(() => pdf2img(dir + '/tmp.pdf'))
        // Now we retrieve the text from the images
        .then(() => fs.readdirSync(dir).filter(fn => fn.endsWith('.jpg'))) // TODO: promisify
        .then(fileNames => Promise.all(fileNames.map(path => img2txt(dir + '/' + path))))
        // Combine text files and insert text into object
        .then(() => fs.readdirSync(dir).filter(fn => fn.endsWith('.txt')))
        .then(fileNames => fileNames.map(fn => fs.readFileSync(dir + '/' + fn, 'utf-8')))
        .then(textArray => textArray.reduce(((accumulator, currentValue) => accumulator + ' ' + currentValue)))
        .then(completeText => cmf.document = completeText)
        .then(() => {
            console.log(cmf)
            // Save object to database
            cmf.save()
            // Destroy the tmpdir
            cleanup(function cleanedUp (err) {
                if (err) console.error('Error removing tmpdir!', err)
            })
        })
    })
}


mongoose.connect('mongodb://localhost:27017/webscraping')


var cmfDocumentSchema = new mongoose.Schema({
    documentId: String,
    url: String,
    date: Date,
    slug: String,
    lang: String,
    entity: String,
    subject: String,
    document: String
}, { collection: 'cmf' })


var cmfDocument = mongoose.model('cmfDocument', cmfDocumentSchema);


var db = mongoose.connection


db.on('error', console.error.bind(console, 'connection error:'))


db.once('open', async function() {

    // Get all cmfDocuments that do not have their docuement text
    var missingDocument = await cmfDocument.find({ document: null }).exec()

    Promise.all(missingDocument.map(item => limit(() => retrieveDocument(item))))

    // process.exit()
})
