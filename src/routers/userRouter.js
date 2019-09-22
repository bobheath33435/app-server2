const express = require('express')
const userRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const { userSchema, userName, password, email, firstName, lastName,
    subscriptionDate, membershipDate, role, orginization, purpose, 
    phone, key, status} = require('../models/userSchema')
const log = console.log;

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

userRouter.post('/register', async (req, res) => {
    try{
        logger.error(chalk.rgb(255,255,0)("req.body: " + JSON.stringify(req.body)))
        logger.error(chalk.rgb(255,0,255)("req.params: " + JSON.stringify(req.params)))
        const clientData = req.body.clientData
        if(undefined == clientData)
            return res.status(500).send(userRouter.NO_CLIENT_DATA)

    //     logger.info('Processing register')
    //     console.log(`req: ${JSON.stringify(req)}`)

    //     const clientData = req.body.clientData
    //     logger.info(`clientData: ${JSON.stringify(clientData, undefined, 2)}`)
        res.status(200).send("Gotcha")
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Fatal error in /register: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        res.status(500).send(userRouter.INVALID_REQUEST)
    }
})

userRouter.NO_CLIENT_DATA = "No Client Data"
userRouter.INVALID_REQUEST = "Invalid Request"
module.exports = { userRouter }