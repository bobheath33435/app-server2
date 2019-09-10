const mongoose = require('mongoose');

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

});

module.exports = congressSchema
