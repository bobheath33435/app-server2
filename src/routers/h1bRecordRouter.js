const mongoose = require('mongoose')
const express = require('express')
const h1bRecordRouter = express.Router()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const { CASE_NUMBER, YEAR, WAGE_LEVEL, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_STATE, TOTAL_WORKERS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        h1bRecord } 
            = require('../models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
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
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bCount', async (req, res) => {
    try{
        logger.info('Processing get');
        console.log(req.body)
        const year = req.body[YEAR];
        console.log('Year: ' + year)
        const caseNumber = req.body[CASE_NUMBER];
        console.log('Case Number: ' + caseNumber)
        const body = req.body
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        debugger
    
        const count = await h1bModel.countDocuments(req.body)
        res.status(200).send({ "count": count })
    }catch(e){
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bWsCd', async (req, res) => {
    try{
        logger.info('Processing get worksite congressional district');
        console.log(req.body)
        const year = req.body[YEAR];
        console.log('Year: ' + year)
        const wsCD = req.body[WORKSITE_CONGRESS_DISTRICT];
        console.log('Worksite Congressional District: ' + wsCD)
        const wsState = req.body[WORKSITE_STATE];
        console.log('Worksite State: ' + wsState)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        if(undefined === wsCD){
            return res.status(500).send("Invalid worksite congressional district")
        }
        if(undefined === wsState){
            return res.status(500).send("Invalid worksite state")
        }
        debugger
    
        const h1bRecords = await h1bModel.find({WORKSITE_CONGRESS_DISTICT: wsCD,
                                                WORKSITE_STATE: wsState })
        res.status(202).send(h1bRecords)
    }catch(e){
        res.status(500).send("Invalid request")
    }
})

h1bRecordRouter.get('/h1bWsState', async (req, res) => {
    try{
        logger.info('Processing get worksite state');
        console.log(req.body)
        const year = req.body[YEAR];
        console.log('Year: ' + year)
        const wsState = req.body[WORKSITE_STATE];
        console.log('Worksite State: ' + wsState)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        if(undefined === wsState){
            return res.status(500).send("Invalid worksite state")
        }
        debugger
    
        const h1bRecords = await h1bModel.find({WORKSITE_STATE: wsState })
        // log(h1bRecords)
        const h1bSummary = summarize(h1bRecords)
        res.status(201).json(h1bSummary)
    }catch(e){
        res.status(500).send("Invalid request " + e)
    }
})

h1bRecordRouter.get('/h1bSummary', async (req, res) => {
    try{
        logger.info('Processing summary');
        log(chalk.bgYellow.red(JSON.stringify(req.body)))
        const year = req.body[YEAR];
        log(chalk.bgGreenBright.red('Year: ' + year))
        const caseNumber = req.body[CASE_NUMBER];
        log('Case Number: ' + caseNumber)
     
        const h1bModel = modelMap[year]
        if(undefined === h1bModel){
            return res.status(500).send("Invalid year")
        }
        debugger
    
        const h1bRecords = await h1bModel.find(req.body)
        const h1bSummary = summarize(h1bRecords)
        res.status(202).json(h1bSummary)
    }catch(e){
        res.status(500).send("Invalid request")
    }
})

const summarize = (h1bRecords) => {

    var summaryRecord = {
        wageLevel1: 0,
        wageLevel2: 0,
        wageLevel3: 0,
        wageLevel4: 0,
        unspecified: 0
    }

    h1bRecords.forEach( (h1bRecord, index ) => {
        if(LEVEL_1 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevel1 += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_2 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevel2 += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_3 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevel3 += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_4 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevel4 += h1bRecord[TOTAL_WORKERS]
        }else{
            summaryRecord.unspecified += h1bRecord[TOTAL_WORKERS]
        }

    })

    return summaryRecord
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
        res.send(error)
    })
})



module.exports = h1bRecordRouter