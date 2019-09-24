const mongoose = require('mongoose')
const express = require('express')
const congressRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const CongressModel = require('../models/congressSchema')
const log = console.log;
const { compress, decompress } = require('../utilities/compression')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

congressRouter.get('/congress', async (req, res) => {
    try{
        logger.info('Processing get of congress data');
     
        if(undefined === CongressModel){
            return res.status(500).send("Should not happen")
        }
    
        var congress = await CongressModel.find({"key": "congress"})
        congress = congress[0].congress
        congress = decompress(congress)
        res.status(202).send(congress)
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Congress request failed: " + e))
        logger.error(chalk.bgRed.white.bold("StackXX: " + e.stack))
        res.status(500).send("Invalid request")
    }
})




module.exports = congressRouter