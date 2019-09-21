const mongoose = require('mongoose')
const express = require('express')
const h1bRecordRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const moment = require('moment')
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
const { summarize, decompressSummaryRecord, compressSummaryRecord,
            createKey, summaryMap } = require('../utilities/summarize')
const logger = log4js.getLogger('h1bData');

h1bRecordRouter.get('/h1b', async (req, res) => {
    try{
        logger.info('Processing get');
        logger.info(chalk.bgYellow.red(JSON.stringify(req.body)))
        const year = req.body.YEAR;
        logger.info(chalk.bgGreenBright.red('Year: ' + year))
        const caseNumber = req.body.CASE_NUMBER;
        logger.info('Case Number: ' + caseNumber)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
    
        const h1bRecords = await h1bModel.find(req.body)
        res.status(202).json(h1bRecords)
    }catch(e){
        logger.error('Route /h1b: ' + e);
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bCaseNumber', async (req, res) => {
    try{
        const beginTime = moment()
        logger.info('Processing get');
        var myReq = _.clone(req)
        logger.info(chalk.bgYellow.red(`req: ${JSON.stringify(req.body)}`))
        // logger.info(chalk.bgYellow.red(`myReq: ${JSON.stringify(myReq.body)}`))
        // myReq[CASE_NUMBER] = createCaseNumberQueryArray(myReq.body[CASE_NUMBER])
        logger.info(chalk.bgYellow.red(`myReq: ${JSON.stringify(myReq.body)}`))
        const year = myReq.body.YEAR;
        logger.info(chalk.bgGreenBright.red('Year: ' + year))
        const caseNumber = myReq.body[CASE_NUMBER];
        logger.info('Case Number: ' + caseNumber)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
    
        const h1bRecords = await h1bModel.find(myReq.body)
        calcTime(beginTime, myReq.body)
        res.status(200).json(h1bRecords)
    }catch(e){
        logger.error('Route /h1bCaseNumber: ' + e);
        logger.error('Stack: ' + e.stack);
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bCount', async (req, res) => {
    try{
        logger.info('Processing get');
        logger.info(req.body)
        const year = req.body[YEAR];
        logger.info('Year: ' + year)
        // const caseNumber = req.body[CASE_NUMBER];
        // logger.info('Case Number: ' + caseNumber)
        // const body = req.body
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
    
        const count = await h1bModel.countDocuments(req.body)
        res.status(200).send({ "count": count })
    }catch(e){
        logger.error('Route /h1bCount: ' + e);
        res.status(500).send("Invalid request " + e)
    }
})

h1bRecordRouter.get('/h1bWsCd', async (req, res) => processWsCd(req, res))

const processWsCd = async(req, res) => {
    try{
        logger.info('Processing get worksite congressional district');
        logger.info(req.body)
        const year = req.body[YEAR];
        logger.info('Year: ' + year)
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
        await performQuery(req, res)     
    }catch(e){
        logger.error('Route /h1bWsCd: ' + e);
        logger.error('Stack: ' + e.stack);
    }
}

h1bRecordRouter.get('/h1bWsState', async (req, res) => 
            processWsState(req, res))

const processWsState = async (req, res) => {
    logger.info('Processing get worksite state');
    try{
        logger.info('Processing get worksite state inside');
        logger.info(req.body)
        const year = req.body[YEAR];
        logger.info('Year: ' + year)
        const wsState = req.body[WORKSITE_STATE];
        if(_.isEmpty(wsState)){
            return res.status(500).send("Invalid worksite state")
        }
        logger.info('Worksite State: ' + wsState)
        await performQuery(req, res)     
    }catch(e){
        logger.error('Route /h1bWsState: ' + e);
        logger.error('Stack: ' + e.stack);
        res.status(500).send("Invalid request " + e)
    }
}

h1bRecordRouter.get('/h1bSummary', async (req, res) => {
    try{
        logger.info('Processing summary');
        logger.info(chalk.bgYellow.red(JSON.stringify(req.body)))
        await performQuery(req, res)
    }catch(e){
        logger.error('Route /h1bSummary: ' + e);
        logger.error('Stack: ' + e.stack);
        res.status(500).send("Invalid request")
    }
})

const performQuery = async (req, res) => {
    const beginTime = moment()
    const query = req.body
    const year = query[YEAR];
    const key = createKey(query)
    logger.info(chalk.bgRed.white('Key: ' + key))
    logger.info(chalk.bgGreenBright.red('Year: ' + year))
    var h1bSummary = {"data": {}}

    const compress = true
    if(true == summaryMap[key]){
        logger.info("Sending summary data")
        const summaryModel = modelMap['summary']
        h1bSummary = await summaryModel.find({ "key": key })
        h1bSummary = h1bSummary[0]['summary']
        if(false == compress){
            h1bSummary = decompressSummaryRecord(h1bSummary)
        }
    }else{
        logger.info("Sending read data")
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }    
        const h1bRecords = await h1bModel.find(query)
        logger.trace(h1bRecords)
        h1bSummary = summarize(h1bRecords, query)
        if(true == compress){
            h1bSummary = compressSummaryRecord(h1bSummary)
        }
    }
    calcTime(beginTime, query)
    return res.status(200).json(h1bSummary)
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

const calcTime = (beginTime, query) => {
    const endTime = moment()
    const diff = (endTime - beginTime) / 1000.
    if(diff > 2.5){
        logger.warn(chalk.bgRed.white.bold(`Bad Time: ${diff} secs -- query: `)
                 + chalk.bgRed.white.bold(`${JSON.stringify(query)}`))
    }else if(diff > 1.0){
        logger.warn(chalk.bgHex("#cc4400").white.bold(`Warn Time: ${diff} secs -- query: `)
                 + chalk.bgHex("#cc4400").white.bold(`${JSON.stringify(query)}`))  
    }else{
        logger.info(chalk.bgHex("#003300").white.bold(`Good Time: ${diff} secs -- query: `)
                 + chalk.bgHex("#003300").white.bold(`${JSON.stringify(query)}`))
    }
}

const createCaseNumberQueryArray = (caseNumbers) => {
    // It appears that I do not need this routine. I am leaving it because I may need
    // it at a later date.
    if(!_.isArray(caseNumbers)){
        if(!_.isString(caseNumbers)){
            const str = JSON.stringify(caseNumbers)
            logger.info(`caseNumbers: ${JSON.stringify(caseNumbers, undefined, 2)}`)
            throw(`${h1bRecordRouter.INVALID_CASE_NUMBER}${str}`)
        }
        return caseNumbers
    }
    var caseNumberArray = []
    caseNumbers.forEach((caseNumber) => {
        if(!_.isString(caseNumber)){
            const str = JSON.stringify(caseNumber)
            throw(`${h1bRecordRouter.INVALID_CASE_NUMBER}${str}`)
        }
        var caseNumberItem = {}
        caseNumberItem[CASE_NUMBER] = caseNumber
        caseNumberArray.push(caseNumberItem)

    })
    return { $or: caseNumberArray }
}
h1bRecordRouter.INVALID_CASE_NUMBER = 'Case Number is invalid: '
module.exports = { h1bRecordRouter, performQuery, processWsState, createCaseNumberQueryArray }