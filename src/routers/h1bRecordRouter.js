const mongoose = require('mongoose')
const express = require('express')
const h1bRecordRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const _ = require('lodash')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        UNSPECIFIED, h1bRecord } 
            = require('../models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const { summarize, createKey, summaryMap } = require('../utilities/summarize')
const logger = log4js.getLogger('h1bData');

h1bRecordRouter.get('/h1b', async (req, res) => {
    try{
        logger.info('Processing get');
        log(chalk.bgYellow.red(JSON.stringify(req.body)))
        const year = req.body.YEAR;
        log(chalk.bgGreenBright.red('Year: ' + year))
        const caseNumber = req.body.CASE_NUMBER;
        log('Case Number: ' + caseNumber)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        debugger
    
        const h1bRecords = await h1bModel.find(req.body)
        res.status(202).json(h1bRecords)
    }catch(e){
        logger.error('Route /h1b: ' + e);
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bCount', async (req, res) => {
    try{
        logger.info('Processing get');
        log(req.body)
        const year = req.body[YEAR];
        log('Year: ' + year)
        const caseNumber = req.body[CASE_NUMBER];
        log('Case Number: ' + caseNumber)
        const body = req.body
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        debugger
    
        const count = await h1bModel.countDocuments(req.body)
        res.status(200).send({ "count": count })
    }catch(e){
        logger.error('Route /h1bCount: ' + e);
        res.status(500).send("Invalid request " + e)
    }
})

h1bRecordRouter.get('/h1bWsCd', async (req, res) => {
    try{
        logger.info('Processing get worksite congressional district');
        logger.info(req.body)
        const year = req.body[YEAR];
        logger.info('Year: ' + year)
        debugger
        const wsCD = req.body[WORKSITE_CONGRESS_DISTRICT];
        logger.info('Worksite Congressional District: ' + wsCD)
        if(!_.isNumber(wsCD)){
            return res.status(500).send("Invalid worksite congressional district")
        }
        const wsState = req.body[WORKSITE_STATE];
        logger.info('Worksite State: ' + wsState)
        if(_.isEmpty(wsState)){
            return res.status(500).send("Invalid worksite state")
        }
        const h1bSummary = await performQuery(req.body)     
        res.status(200).json(h1bSummary)
    }catch(e){
        logger.error('Route /h1bWsCd: ' + e);
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bWsState', async (req, res) => {
    try{
        logger.info('Processing get worksite state');
        logger.info(req.body)
        const year = req.body[YEAR];
        logger.info('Year: ' + year)
        const wsState = req.body[WORKSITE_STATE];
        if(_.isEmpty(wsState)){
            return res.status(500).send("Invalid worksite state")
        }
        logger.info('Worksite State: ' + wsState)
        const h1bSummary = await performQuery(req.body)     
        res.status(200).json(h1bSummary)
    }catch(e){
        logger.error('Route /h1bWsState: ' + e);
        res.status(500).send("Invalid request " + e)
    }
})

h1bRecordRouter.get('/h1bSummary', async (req, res) => {
    try{
        logger.info('Processing summary');
        logger.info(chalk.bgYellow.red(JSON.stringify(req.body)))
        const h1bSummary = await performQuery(req.body)
        res.status(200).json(h1bSummary)
    }catch(e){
        logger.error('Route /h1bSummary: ' + e);
        res.status(500).send("Invalid request")
    }
})

const performQuery = async (query) => {
    const year = query[YEAR];
    const key = createKey(query)
    logger.info(chalk.bgRed.white('Key: ' + key))
    logger.info(chalk.bgGreenBright.red('Year: ' + year))
    var h1bSummary = {"data": {}}
    if(true == summaryMap[key]){
        logger.info("Sending summary data")
        const summaryModel = modelMap['summary']
        h1bSummary = await summaryModel.find({ "key": key })
        h1bSummary = h1bSummary[0]['summary']
    }else{
        logger.info("Sending read data")
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }    
        const h1bRecords = await h1bModel.find(query)
        logger.trace(h1bRecords)
        h1bSummary = summarize(h1bRecords, query)
    }
    return h1bSummary
}

h1bRecordRouter.post('/h1b', (req, res) => {
    logger.info('Processing post');
    console.log(req.body)
    const year = req.body[YEAR];
    console.log('Year: ' + year)
 
    const h1bRecord = new modelMap[year](req.body)
    h1bRecord.save().then(() => {
        logger.info('H1bRecord: ' + h1bRecord)
        res.send(h1bRecord)
    }).catch((error) => {
        logger.error('Route post /h1b: ' + e);
        res.send(error)
    })
})



module.exports = h1bRecordRouter