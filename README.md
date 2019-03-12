# webscraping

Webscraping for NL information.

## Data sources

The package handles two main types of sources at the moment: traditional news outlets and the [CMF Chile (Cámara para el Mercado Financiero)](http://www.cmfchile.cl) site.

### News outlets

The scraping is a two-step process:

1. Scrape the source's home page to obtain the links to news artciles.
2. Using the links obtained in step 1, we scrape each article.

Scrapable sites are defined in the `sites.json` at the root of the project, requiring the following parameters:

1. `slug`: a short id for the source. Ex: "latercera".
2. `url`: the base url for the source. Ex: "https://www.latercera.com".
3. `lang`: the language of the site. Ex: "es".
4. `articleUrlRegex`: a pattern which all news article urls contain. This is to skip links in the home page that are not articles. Ex: "noticia".
5. `articleHtmlClass`: the html class of the div containing the article text in the article html. Ex: ".col-article-main".

To run the home page scraping:

```bash
node scrape_home --slug 'site-slug'
```

And to run the article scraping:

```bash
node scrape_documents --slug 'site-slug'
```

Remember to replace `site-slug` with the corresponding slug. The scripts asume a MongoDB database named `webscraping` and use the collection `links`.

### CMF

CMF scraping retrieves "Hechos Escenciales". Unfortunately, the site requires a Captcha for displaying the list of available documents.

For the moment, to get arround the problem we must use the `cmf.static.js` script, which requires a static html file of the [document list](http://www.cmfchile.cl/institucional/hechos/hechos.php) under the name `static/cmf.html` to be manually added. An example is added in the repository, including documents from January 1st 2001 to March 1st 2019.

To extract the article links from the static html:

```bash
node scrape_home/cmf.static
```

Documents are available as pdf image files, so to retrieve the text we must first convert the files to images and then run an OCR (optical character recognition) algorithm over them. This is done using `child_processes` (subroutines that execute a bash script) and the software described in [the next section](#setup).

Since the child processes and database operations can be quite slow, the code is run asyncronously. As there can be many documents in the document list, we must limit the ammount of documents processed simultaneosly. This is done with the `-p` parameter, which sets the maximum number of simultaneos processing. 5-15 seems like a good range for personal computers.

To run the scrip:

```bash
node scrape_documents/cmf -p 5
```

The scripts asume a MongoDB database named `webscraping` and use the collection `cmf`.

## Setup

### Install node dependencies:

```
npm install
```

### Install ImageMagick

This is the software used to convert pdf files to image files.

In windows:

```bash
choco install imagemagick
```

In Linux:

```bash
apt-get install imagemagick
```

### Install Tesseract

This is the OCR software. Releases can be found in their [GitHub reposity](https://github.com/tesseract-ocr/tesseract).
