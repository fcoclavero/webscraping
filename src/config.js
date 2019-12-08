var config = {}

config.sites = {
    latercera: {
        slug: 'latercera',
        url: 'https://www.latercera.com',
        lang: 'es',
        articleUrlRegex: 'noticia',
        articleHtmlClass: '.col-article-main'
    },
    emol: {
        slug: 'emol',
        url: 'https://www.emol.com',
        lang: 'es',
        articleUrlRegex: 'noticias',
        articleHtmlClass: '.cont-new-detalle-noti'
    },
    elmostrador: {
        slug: 'elmostrador',
        url: 'https://www.elmostrador.cl',
        lang: 'es'
    },
    ft: {
        slug: 'ft',
        url: 'https://www.ft.com',
        lang: 'en'
    },
    yahoo: {
        slug: 'yahoo',
        url: 'https://finance.yahoo.com',
        lang: 'en'
    }
}

config.connectionUrl = 'mongodb://localhost/webscraping'

module.exports = config
