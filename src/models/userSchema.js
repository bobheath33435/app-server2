const mongoose = require('mongoose');

const userName = "userName"
const password = "password"
const email = "email"
const firstName = "firstName"
const lastName = "lastName"
const subscriptionDate = "subscriptionDate"
const membershipDate = "membershipDate"
const role = "role"
const orginization = "orginization"
const purpose = "purpose"
const phone = "phone"
const key = "key"
const status = "status"

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
		type: String,
	},
	membershipDate: {
		type: String,
	},
	role: {
		type: String,
		required: true,
		enum: roles,
		default: 'User'
	},
	orginization: {
		type: String,
		default: ""
	},
	purpose: {
		type: String,
		default: ""
	},
	phone: {
		type: String,
		default: ""
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

module.exports = { userName, password, email, firstName, lastName,
			subscriptionDate, membershipDate, role, orginization, purpose, 
			phone, key, status, userSchema }
