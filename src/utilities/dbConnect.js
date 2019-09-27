const mongoose = require('mongoose');
const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')
const log = console.log
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

const mongoConnect = async () => {
    logger.info('Before connect')
    const connectURL = 'mongodb://127.0.0.1:27017/h1b'
    await mongoose.connect(connectURL, {
        useNewUrlParser: true,
        useCreateIndex: true
    })
    logger.info('After connect')
}

module.exports = { mongoConnect  }