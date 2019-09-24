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

const congressKey = "congress"
// SUmmary Schema
const congressSchema = mongoose.Schema({
	key: {
		type: String,
    	required: true
	},
	congress: {
		type: Object,
    	required: true
	},

})

// const connectURL = 'mongodb://127.0.0.1:27017/h1b'

// mongoose.connect(connectURL, {
// 	useNewUrlParser: true,
// 	useCreateIndex: true
// })

const CongressModel = mongoose.model(congressKey, congressSchema)

module.exports = { CongressModel }
