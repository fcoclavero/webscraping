const $ = require('cheerio')


var config = {}

config.sites = {
  latercera: {
    slug: 'latercera',
    url: 'https://www.latercera.com',
    lang: 'es',
    articleUrlRegex: 'noticia',
    articleHtmlClass: '.content-conteniendo-contenido',
    extractContent: function (html) {
      reg = /var singlePost = (\{.*\};)/
      return JSON.parse(
        $('script:not([src])', html).filter(function (i, script) {
          return RegExp(reg).test(script.children[0].data)
        })[0].children[0].data.match(reg)[1].slice(0, -1)
      )
    }
  },
//   emol: {
//     slug: 'emol',
//     url: 'https://www.emol.com',
//     lang: 'es',
//     articleUrlRegex: 'noticias',
//     articleHtmlClass: '.cont-new-detalle-noti'
//   },
//   elmostrador: {
//     slug: 'elmostrador',
//     url: 'https://www.elmostrador.cl',
//     lang: 'es'
//   },
//   ft: {
//     slug: 'ft',
//     url: 'https://www.ft.com',
//     lang: 'en'
//   },
//   yahoo: {
//     slug: 'yahoo',
//     url: 'https://finance.yahoo.com',
//     lang: 'en'
//   }
}

config.connectionUrl = 'mongodb://localhost/webscraping'

module.exports = config
