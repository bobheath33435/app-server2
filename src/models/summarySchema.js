const mongoose = require('mongoose');

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

});

module.exports = summarySchema
