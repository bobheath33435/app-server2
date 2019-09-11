const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('./config')
const modelMap = require('./models/dbRecords')
const { compress, decompress } = require('./utilities/compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('./models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

var employers = {}
var worksiteAddrs = {}
var counties = {}
var cities = {}

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
    configSystem(obj.platform)
    logger.info(chalk.bgBlue.white.bold(`LCA file name template: ${config.lcaFileTemplate}`))

    fs.createReadStream(config.lcaFileTemplate)
        .pipe(csv())
        .on('error', (err) => logger.error(`ERROR - ${err}`))
        .on('data', (chunk) => {
            const cityKey = chunk[WORKSITE_CITY]
            if(undefined == cities[cityKey]){
debugger
                cities[cityKey] = {
                    city: cityKey,
                    lcaCount: 0,
                    totalWorkers: 0
                }
            }
            cities[cityKey].lcaCount += 1
            cities[cityKey].totalWorkers += Number(chunk[TOTAL_WORKERS])
            // if(cities[cityKey].totalWorkers > 100){
            //     logger.info(`city: ${cities[cityKey].city}; totalWorkers: ${cities[cityKey].totalWorkers}`)
            // }


            logger.trace(chalk.bgBlue.white.bold(`${JSON.stringify(chunk, undefined, 2)}`))
        })
        .on('end', () => {
            results = { cities, counties, employers, worksiteAddrs}
            saveLcas(results)
        })
}

const saveLcas = async(results) => {
    try{
        const cities = results.cities
        logger.trace(JSON.stringify(cities, undefined, 2))
        // var congressRecord = {
        //     "key": 'congress',
        //     "congress": compress(congress)
        // }
        // const congressModel = modelMap['congress']
        // const congressSummary = congressModel(congressRecord)
        // logger.info(chalk.bgBlue('Save congress started'))
        // await congressSummary.save()
        // logger.info(chalk.bgBlue('Save congress complete'))    
        logger.info(chalk.bgBlue(`cities: ${JSON.stringify(cities, undefined, 2)}`))  
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Saving congress data failed: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        
    }
}


si.osInfo(cb)

