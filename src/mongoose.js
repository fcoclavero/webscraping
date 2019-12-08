const mongoose = require('mongoose')
const config = require('./config')


mongoose.set('useCreateIndex', true)
mongoose.connect(config.connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = mongoose
