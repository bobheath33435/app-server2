const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('./models/dbRecords')
const { summarize, createKey } = require('./utilities/summarize')

const logger = log4js.getLogger('h1bData');

const bldSummaries = async () => {
   logger.info('Build summaries');

    try{
        log("Started")
        const h1bModel = modelMap[2017]
        // throw ("Error")
        setTimeout( () => {
            log("Timer expired")
        }, 0)
        var year = 2017
        var worksiteState = "WY"
        const h1bRecords = await h1bModel.find(
            {
                "YEAR": year,
                "WORKSITE_STATE": worksiteState
            })
        const h1bSummary = summarize(h1bRecords)
        log(JSON.stringify(h1bSummary, undefined, 2))
        log("Finished")
    }catch(e){
        logger.info(chalk.bgRed.white('Build FAILED!!'));
        logger.info(chalk.bgRed.white('Build FAILED!!') + '  ' + e);
    }
    process.exit()
}

bldSummaries();

