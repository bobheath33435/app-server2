const mongoose = require('mongoose');

const summaryKey = 'summary'
const summarySaveKey = 'summarySave'

// SUmmary Schema
const summarySchema = mongoose.Schema({
	key: {
		type: String,
    	required: true
	},
	summary: {
		type: Object,
    	required: true
	},

})

const SummaryModel = mongoose.model(summaryKey, summarySchema)
const SummarySaveModel = mongoose.model(summarySaveKey, summarySchema)

module.exports = { SummaryModel, SummarySaveModel } 
