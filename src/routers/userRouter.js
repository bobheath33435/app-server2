const express = require('express')
const userRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')

const { userSchema, userKey, userName, password, email, firstName, lastName,
    subscriptionDate, membershipDate, role, orginization, purpose, 
    phone, key, status} = require('../models/userSchema')
const log = console.log;

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const { modelMap } = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

userRouter.post('/register', async (req, res) => {
    try{
        logger.info('Processing register')
        logger.trace(chalk.rgb(255,255,0)("req.body: " + JSON.stringify(req.body)))
        logger.trace(chalk.rgb(255,0,255)("req.params: " + JSON.stringify(req.params)))
        var clientData = req.body.clientData
        if(undefined == clientData)
            return res.status(500).send(userRouter.NO_CLIENT_DATA)
        const userModel = modelMap[userKey]
        if(undefined === userModel){
                return res.status(500).send(userRouter.INVALID_REQUEST)
        }
        
        const newUser = new userModel({
            userName: clientData.userName,
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            email: clientData.email,
            password: clientData.password,
            status: "registered"
        })
        if(undefined == newUser){
            return res.status(500).send("New user not created")
        }
        await newUser.save()
        logger.trace(`clientData: ${JSON.stringify(clientData, undefined, 2)}`)
        res.status(201).send(userRouter.NEW_USER_CREATED)
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Exception in /register: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        res.status(500).send(userRouter.INVALID_REQUEST)
    }
})

userRouter.post('/login', async (req, res) => {
    try{
        logger.info('Processing login')
        logger.trace(chalk.rgb(255,255,0)("req.body: " + JSON.stringify(req.body)))
        logger.trace(chalk.rgb(255,0,255)("req.params: " + JSON.stringify(req.params)))
        var clientData = req.body.clientData
        if(undefined == clientData)
            return res.status(500).send(userRouter.NO_CLIENT_DATA)
        const userModel = modelMap[userKey]
        if(undefined === userModel){
                return res.status(500).send(userRouter.INVALID_REQUEST)
        }
        const user = await userModel.findByCredentials(clientData)
        logger.trace(chalk.rgb(255,0,255)("user: " + JSON.stringify(user)))
        res.status(200).send(user)  
     }catch(e){
        logger.error(chalk.bgRed.white.bold("Exception in /login: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        res.status(500).send(userRouter.INVALID_REQUEST)
    }
})

userRouter.NO_CLIENT_DATA = "No Client Data"
userRouter.INVALID_REQUEST = "Invalid Request"
userRouter.NEW_USER_CREATED = "New UserCreated"
userRouter.GOTCHA = "Gotcha"
module.exports = { userRouter }