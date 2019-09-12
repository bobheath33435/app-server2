const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('../config')
const modelMap = require('../models/dbRecords')
const { compress, decompress } = require('../utilities/compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('../models/h1bRecordSchema')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

const parseFile = async(filename, autoCompleteMap) => {
    logger.info(chalk.bgBlue.white.bold(`parsing ${filename}`))
    return new Promise((resolve, reject) => {
        fs.createReadStream(filename)
        .pipe(csv())
        .on('error', (err) => {
            logger.error(`ERROR - ${err}`)
            return reject(error)
        })
        .on('data', (chunk) => {
            var cities = autoCompleteMap.cities
            const cityKey = chunk[WORKSITE_CITY]
            if(undefined == cities[cityKey]){
                // logger.info(chalk.bgGreen.white.bold(`reading ${chunk[WORKSITE_CITY]}`))
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
            // results = { cities, counties, employers, worksiteAddrs}
            return resolve(autoCompleteMap)
        })
    
    })
}
module.exports = { parseFile }