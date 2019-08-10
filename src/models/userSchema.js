const mongoose = require('mongoose');

const roles = ['expired',
								'pending',
								'User',
								'basic',
								'extended',
								'preferred',
								'trial',
								'goodwill',
								'admin'];

// User Schema
const userSchema = mongoose.Schema({
	userName: {
		type: String,
		index: true,
    	unique: true,
    	required: true
	},
	password: {
		type: String,
    	required: true
	},
	email: {
		type: String,
    	unique: true,
    	required: true,
	},
	firstName: {
		type: String,
    	required: true
	},
  	lastName: {
    	type: String,
    	required: true
 	},
	subscriptionDate: {
		type: Number,
	},
	membershipDate: {
		type: Number,
	},
	role: {
		type: String,
		required: true,
		enum: roles,
		default: 'User'
	},
	key: {
		type: String,
		default: 'none'
	},
	status: {
		type: String,
		default: ""
	}
});

module.exports = userSchema
