const mongoose = require('mongoose')
const express = require('express')
const autocompleteRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const { compress, decompress } = require('../utilities/compression')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

autocompleteRouter.get('/autocomplete', async (req, res) => {
    try{
        logger.info('Processing get of AutoComplete data');
     
        const autocompleteModel = modelMap['autocomplete']
        if(undefined === autocompleteModel){
            return res.status(500).send("Should not happen")
        }
    
        var autocomplete = await autocompleteModel.find({"key": "autocomplete"})
        autocomplete = autocomplete[0].autocomplete
        autocomplete = decompress(autocomplete)
        res.status(202).send(autocomplete)
    }catch(e){
        logger.error(chalk.bgRed.white.bold("AutoComplete data request failed: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        res.status(500).send("Invalid request")
    }
})

module.exports = autocompleteRouter