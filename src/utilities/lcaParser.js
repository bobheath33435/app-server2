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
debugger
            accumulateData(autoCompleteMap.employers, EMPLOYER_NAME, chunk)
            // var employers = autoCompleteMap.employers
            // const employerKey = chunk[EMPLOYER_NAME]
            // if(undefined == employers[employerKey]){
            //     logger.trace(chalk.bgGreen.white.bold(`reading ${chunk[EMPLOYER_NAME]}`))
            //     employers[employerKey] = {
            //         EMPLOYER_NAME: employerKey,
            //         TOTAL_LCAS: 0,
            //         TOTAL_WORKERS: 0
            //     }
            // }
            // employers[employerKey].TOTAL_LCAS += 1
            // employers[employerKey].TOTAL_WORKERS += Number(chunk[TOTAL_WORKERS])

            accumulateData(autoCompleteMap.worksiteCities, WORKSITE_CITY, chunk)
            // var worksiteCities = autoCompleteMap.worksiteCities
            // const cityKey = chunk[WORKSITE_CITY]
            // if(undefined == worksiteCities[cityKey]){
            //     logger.trace(chalk.bgGreen.white.bold(`reading ${chunk[WORKSITE_CITY]}`))
            //     worksiteCities[cityKey] = {
            //         WORKSITE_CITY: cityKey,
            //         TOTAL_LCAS: 0,
            //         TOTAL_WORKERS: 0
            //     }
            // }
            // worksiteCities[cityKey].TOTAL_LCAS += 1
            // worksiteCities[cityKey].TOTAL_WORKERS += Number(chunk[TOTAL_WORKERS])

            accumulateData(autoCompleteMap.worksiteCounties, WORKSITE_COUNTY, chunk)
            // var worksiteCounties = autoCompleteMap.worksiteCounties
            // const countyKey = chunk[WORKSITE_COUNTY]
            // if(undefined == worksiteCounties[countyKey]){
            //     logger.trace(chalk.bgGreen.white.bold(`reading ${chunk[WORKSITE_COUNTY]}`))
            //     worksiteCounties[countyKey] = {
            //         WORKSITE_COUNTY: countyKey,
            //         TOTAL_LCAS: 0,
            //         TOTAL_WORKERS: 0
            //     }
            // }
            // worksiteCounties[countyKey].TOTAL_LCAS += 1
            // worksiteCounties[countyKey].TOTAL_WORKERS += Number(chunk[TOTAL_WORKERS])
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

const accumulateData = (map, property, chunk) => {
    const key = chunk[property]
    if(undefined == map[key]){
        logger.trace(chalk.bgGreen.white.bold(`reading ${chunk[key]}`))
        const obj = {}
        obj[property] = key
        obj[TOTAL_LCAS] = 0
        obj[TOTAL_WORKERS] = 0
        map[key] = obj
        // map[key] = {
        //     property: key,
        //     TOTAL_LCAS: 0,
        //     TOTAL_WORKERS: 0
        // }
    }
    map[key].TOTAL_LCAS += 1
    map[key].TOTAL_WORKERS += Number(chunk[TOTAL_WORKERS])
}

const sortWithField = (a, b, field) => {
    logger.trace(chalk.bgRed.white.bold(`a: ${JSON.stringify(a, undefined, 2)}; b: ${JSON.stringify(b, undefined, 2)}`))
    if(a[TOTAL_WORKERS] != b[TOTAL_WORKERS])
        return b[TOTAL_WORKERS] - a[TOTAL_WORKERS]
    if(a[TOTAL_LCAS] != b[TOTAL_LCAS])
        return b[TOTAL_LCAS] - a[TOTAL_LCAS]
    if(a[field] == b[field])
        return 0
    return(a[field] > b[field]) ? 1 : -1 
}

const sortEmployerName = (a, b) => sortWithField(a, b, EMPLOYER_NAME)
const sortWorksiteAddr1 = (a, b) => sortWithField(a, b, WORKSITE_ADDR1)
const sortWorksiteCity = (a, b) => sortWithField(a, b, WORKSITE_CITY)
const sortWorksiteCounty = (a, b) => sortWithField(a, b, WORKSITE_COUNTY)
module.exports = { parseFile,
                    sortWithField,
                    sortWorksiteAddr1, 
                    sortWorksiteCity,
                    sortWorksiteCounty,
                    sortEmployerName }