const mongoose = require('mongoose');

congressKey = "congress"
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
const connectURL = 'mongodb://127.0.0.1:27017/h1b'

mongoose.connect(connectURL, {
	useNewUrlParser: true,
	useCreateIndex: true
})

const CongressModel = mongoose.model(congressKey, congressSchema)

module.exports = { CongressModel }
