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

const autocompleteKey = "autocomplete"

// Autocomplete Schema
const autocompleteSchema = mongoose.Schema({
	key: {
		type: String,
    	required: true
	},
	autocomplete: {
		type: Object,
    	required: true
	},

});

const AutocompleteModel = mongoose.model(autocompleteKey, autocompleteSchema)

module.exports = { AutocompleteModel }
