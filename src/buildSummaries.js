const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const states = [{id: "AL",
                 summarizeType: "FULL"}, 
                {id: "CA",
                 summarizeType: "BRIEF"}, 
                {id: "FL",
                 summarizeType: "FULL"}, 
                {id: "NC",
                 summarizeType: "BRIEF"}, 
                {id: "NY",
                 summarizeType: "BRIEF"}, 
                {id: "TX",
                 summarizeType: "FULL"}, 
                {id: "WV",
                 summarizeType: "FULL"},
                {id: "WY",
                 summarizeType: "FULL"}]

const years = [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]

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
const { summarize, summarizeMajor, createKey } = require('./utilities/summarize')

const logger = log4js.getLogger('h1bData');

const processState = ( async(year, stateRecord) => {
    const worksiteState = stateRecord.id
    const summarizeType = stateRecord.summarizeType
    try{
        logger.info(chalk.bgHex("#0aee0a").black("Process States Year: " + year + " - State: " + worksiteState + " - Type: " + summarizeType))
        const h1bModel = modelMap[year]
        const query = {
            "YEAR": year,
            "WORKSITE_STATE": worksiteState
        }
        logger.trace(chalk.bgRed('query: ' + JSON.stringify(query)))
        key = createKey(query)
        logger.info(chalk.bgRed("Key: " + key + ' -- query: ' + JSON.stringify(query)))
    
        logger.trace(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
        const h1bRecords = await h1bModel.find(query)
        logger.trace(chalk.bgBlue('Read data complete'))
        var h1bObject = {}
        if("FULL" == summarizeType){
            h1bObject = summarize(h1bRecords, query)
        }else{
            h1bObject = summarizeMajor(h1bRecords, query)
        }
        logger.trace(chalk.bgBlue('Data summarized'))
        logger.trace(JSON.stringify(h1bObject, undefined, 2))
        var summaryRecord = {
            "key": key,
            "summary": h1bObject
        }
        logger.trace(chalk.bgBlue('Save summary started'))
        const summaryModel = modelMap['summary']
        const h1bSummary = summaryModel(summaryRecord)
        logger.info(chalk.bgBlue('Save summary start'))
        await h1bSummary.save()
        logger.info(chalk.bgBlue('Save summary complete'))
        // return Promise.resolve()
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process State, ${worksiteState}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processStates = async (year) => {
    try{
        await asyncForEach(states, async(stateRecord) => {
           try{
                await processState(year, stateRecord)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${stateRecord.id} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other states.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed('Process States FAILED.'))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processYears = (async () => {
    try{
        await asyncForEach(years, async(year) => {
            logger.info("Process Year: " + year)
            currentYear = year
            try{
                await processStates(year)
            }catch(e){
                log(chalk.bgRed(`Processing ${year} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other years.'))
            }
            
        })
    }catch(e){
        logger.error(chalk.bgRed('Process Years FAILED'))
        // return Promise.reject(e)
    }
    logger.info(chalk.bgBlue('End of building summaries'))
    return Promise.resolve
})

const bldSummaries = async () => {

    logger.info('Build summaries');
    // start()
    logger.info("Started")
    await processYears()
    // await processState(2017, "WV")

    setTimeout( () => {
        log("Timer expired")
    }, 0)
    logger.info(chalk.bgRed.bold("Build complete"))
    process.exit()
 }

bldSummaries();

