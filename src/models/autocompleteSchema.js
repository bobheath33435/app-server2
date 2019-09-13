const mongoose = require('mongoose');

// SUmmary Schema
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

module.exports = autocompleteSchema
