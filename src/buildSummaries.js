const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const states = ["WV", "WY"]
const years = [2017, 2016]

const waitFor = async(num) => {
    setTimeout( () => {
        log("Timer expired")
        Promise.resolve()
    }, num)    
}

const asyncForEach = (async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  })

const start = async () => {
    await asyncForEach([1, 2, 3], async (num) => {
      await waitFor(50);
      console.log(num);
    });
    console.log('Done');
}
   
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('./models/dbRecords')
const { summarize, createKey } = require('./utilities/summarize')

const logger = log4js.getLogger('h1bData');

const processState = ( async(year, worksiteState) => {
    try{
        log("Process States Year: " + year)
        log("State: " + worksiteState)
        debugger
        const h1bModel = modelMap[year]
        const query = {
            "YEAR": year,
            "WORKSITE_STATE": worksiteState
        }
        log(chalk.bgRed('query: ' + JSON.stringify(query)))
        key = createKey(query)
        log("Key: " + key)
        log(chalk.bgRed('query: ' + JSON.stringify(query)))
    
        log(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
        const h1bRecords = await h1bModel.find(query)
        log(chalk.bgBlue('Read data complete'))
        const h1bObject = summarize(h1bRecords, query)
        log(chalk.bgBlue('Data summarized'))
        logger.trace(JSON.stringify(h1bObject, undefined, 2))
        var summaryRecord = {
            "key": key,
            "summary": h1bObject
        }
        log(chalk.bgBlue('Save summary started'))
        const summaryModel = modelMap['summary']
        const h1bSummary = summaryModel(summaryRecord)
        await h1bSummary.save()
        log(chalk.bgBlue('Save summary complete'))
        // return Promise.resolve()
        log(chalk.bgBlue('End of block'))
    
    }catch(e){
        log(chalk.bgRed('Process State failed: ' + e))
        throw e
    }
    return Promise.resolve
})

const processStates = async (year) => {
    try{
        await asyncForEach(states, async(worksiteState) => {
            await processState(year, worksiteState)
        })
    }catch(e){
        log(chalk.bgRed('Process States FAILED'))
        throw(e)
        // return Promise.reject(e)
    }
    log(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processYears = (async () => {
    try{
        await asyncForEach(years, async(year) => {
            log("Process Year: " + year)
            currentYear = year
            await processStates(year)
        })
    }catch(e){
        log(chalk.bgRed('Process Years FAILED'))
        throw(e)
        // return Promise.reject(e)
    }
    log(chalk.bgBlue('End of states asyncLoop'))
    log(chalk.bgBlue('End of asyncLoop for states'))
    return Promise.resolve
})

const bldSummaries = async () => {

    logger.info('Build summaries');
    // start()
    log("Started")
    await processYears()
    // await processState(2017, "WV")

    setTimeout( () => {
        log("Timer expired")
    }, 0)
 }

bldSummaries();

