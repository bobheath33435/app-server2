const mongoose = require('mongoose')
const log4js = require('log4js');
const chalk = require('chalk')

const { h1bRecordSchema } = require('./h1bRecordSchema')
const congressSchema = require('./congressSchema')
const autocompleteSchema = require('./autocompleteSchema')

const congressKey = "congress"
const autocompleteKey = "autocomplete"

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
 
const logger = log4js.getLogger('h1bData');
logger.info('Before connect');

const connectURL = 'mongodb://127.0.0.1:27017/h1b'

mongoose.connect(connectURL, {
    useNewUrlParser: true,
    useCreateIndex: true
})
logger.info('After connect');
const congress = mongoose.model('congress', congressSchema)
const autocomplete = mongoose.model('autocomplete', autocompleteSchema)
const h1B2010 = mongoose.model('H1bRecord10', h1bRecordSchema)
const h1B2011 = mongoose.model('H1bRecord11', h1bRecordSchema)
const h1B2012 = mongoose.model('H1bRecord12', h1bRecordSchema)
const h1B2013 = mongoose.model('H1bRecord13', h1bRecordSchema)
const h1B2014 = mongoose.model('H1bRecord14', h1bRecordSchema)
const h1B2015 = mongoose.model('H1bRecord15', h1bRecordSchema)
const h1B2016 = mongoose.model('H1bRecord16', h1bRecordSchema)
const h1B2017 = mongoose.model('H1bRecord17', h1bRecordSchema)
const h1B2018 = mongoose.model('H1bRecord18', h1bRecordSchema)

const modelMap = {
    2010: h1B2010,
    2011: h1B2011,
    2012: h1B2012,
    2013: h1B2013,
    2014: h1B2014,
    2015: h1B2015,
    2016: h1B2016,
    2017: h1B2017,
    2018: h1B2018
}
modelMap[congressKey] = congress
modelMap[autocompleteKey] = autocomplete
module.exports = { modelMap, congressKey, autocompleteKey }