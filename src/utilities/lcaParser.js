const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('../config')
const { compress, decompress } = require('../utilities/compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, EMPLOYER_ADDRESS,
    EMPLOYER_CITY, EMPLOYER_STATE, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    JOB_TITLE, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
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
            accumulateData(autoCompleteMap.worksiteAddr1s, WORKSITE_ADDR1, chunk)
            accumulateData(autoCompleteMap.worksiteAddr2s, WORKSITE_ADDR2, chunk)
            accumulateData(autoCompleteMap.worksiteCities, WORKSITE_CITY, chunk)
            accumulateData(autoCompleteMap.worksiteCounties, WORKSITE_COUNTY, chunk)
            accumulateData(autoCompleteMap.worksiteStates, WORKSITE_STATE, chunk)
            accumulateData(autoCompleteMap.employers, EMPLOYER_NAME, chunk)
            accumulateData(autoCompleteMap.employerAddresses, EMPLOYER_ADDRESS, chunk)
            accumulateData(autoCompleteMap.employerCities, EMPLOYER_CITY, chunk)
            accumulateData(autoCompleteMap.employerStates, EMPLOYER_STATE, chunk)
            accumulateData(autoCompleteMap.jobTitles, JOB_TITLE, chunk)
            accumulateData(autoCompleteMap.socCodes, SOC_CODE, chunk)
            accumulateData(autoCompleteMap.wageLevels, WAGE_LEVEL, chunk)
    
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
const sortEmployerAddress = (a, b) => sortWithField(a, b, EMPLOYER_ADDRESS)
const sortEmployerCity = (a, b) => sortWithField(a, b, EMPLOYER_CITY)
const sortEmployerState = (a, b) => sortWithField(a, b, EMPLOYER_STATE)
const sortWorksiteAddr1 = (a, b) => sortWithField(a, b, WORKSITE_ADDR1)
const sortWorksiteAddr2 = (a, b) => sortWithField(a, b, WORKSITE_ADDR2)
const sortWorksiteCity = (a, b) => sortWithField(a, b, WORKSITE_CITY)
const sortWorksiteCounty = (a, b) => sortWithField(a, b, WORKSITE_COUNTY)
const sortWorksiteState = (a, b) => sortWithField(a, b, WORKSITE_STATE)
const sortJobTitle = (a, b) => sortWithField(a, b, JOB_TITLE)
const sortSocCode = (a, b) => sortWithField(a, b, SOC_CODE)
const sortWageLevel = (a, b) => sortWithField(a, b, WAGE_LEVEL)
module.exports = { parseFile,
                    accumulateData,
                    sortWithField,
                    sortEmployerName,
                    sortEmployerAddress,
                    sortEmployerCity,
                    sortEmployerState,
                    sortWorksiteAddr1, 
                    sortWorksiteAddr2, 
                    sortWorksiteCity,
                    sortWorksiteCounty,
                    sortWorksiteState,
                    sortJobTitle,
                    sortSocCode,
                    sortWageLevel
                }