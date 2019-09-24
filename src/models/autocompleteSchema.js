const mongoose = require('mongoose');

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
const connectURL = 'mongodb://127.0.0.1:27017/h1b'

mongoose.connect(connectURL, {
	useNewUrlParser: true,
	useCreateIndex: true
})

const AutocompleteModel = mongoose.model(autocompleteKey, autocompleteSchema)

module.exports = { AutocompleteModel }
