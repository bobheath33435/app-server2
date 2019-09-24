const mongoose = require('mongoose')
const log4js = require('log4js');
const chalk = require('chalk')
const bcrypt = require("bcryptjs")

const { modelMap } = require('./dbRecords')
const _ = require('lodash')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
 
const logger = log4js.getLogger('h1bData');

const userKey = "user"
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

userSchema.pre('save', async function(next)  {
	const user = this
	if(user.isModified(password)){
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
})

userSchema.statics.findByCredentials = async(clientData) => {
	logger.trace(`userSchema clientData: ${JSON.stringify(clientData, undefined, 2)}`)
	const query = _.pick(clientData, userName, email)
	// const model = modelMap[userKey]
	const user = await UserModel.findOne(query)
	if(!user){
		throw new Error("Unable to login")
	}
	const isMatch = await bcrypt.compare(clientData[password], user[password])
	if(!isMatch){
		throw new Error("Unable to login")
	}
	return user
}

const UserModel = mongoose.model(userKey, userSchema)
module.exports = { UserModel, userName, password, email, firstName, lastName,
			subscriptionDate, membershipDate, role, orginization, purpose, 
			phone, key, status }
