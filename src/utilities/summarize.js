const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const _ = require('lodash')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
        salaryLevels, h1bRecord } 
            = require('../models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

const summarize = (h1bRecords) => {

    logger.trace('running summarize');
    var summaryRecord = {}
    summaryRecord[TOTAL_WORKERS] = 0
    summaryRecord[TOTAL_LCAS] = h1bRecords.length
    summaryRecord[LEVEL_1] = 0
    summaryRecord[LEVEL_2] = 0
    summaryRecord[LEVEL_3] = 0
    summaryRecord[LEVEL_4] = 0
    summaryRecord[UNSPECIFIED] = 0
    summaryRecord.wageArray = []

    h1bRecords.forEach( (h1bRecord, index ) => {
        if(undefined != h1bRecord[TOTAL_WORKERS]){
            summaryRecord[TOTAL_WORKERS] += h1bRecord[TOTAL_WORKERS]
        }
    
        if(LEVEL_1 == h1bRecord[WAGE_LEVEL]){
            summaryRecord[LEVEL_1] += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_2 == h1bRecord[WAGE_LEVEL]){
            summaryRecord[LEVEL_2] += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_3 == h1bRecord[WAGE_LEVEL]){
            summaryRecord[LEVEL_3] += h1bRecord[TOTAL_WORKERS]
        }else if(LEVEL_4 == h1bRecord[WAGE_LEVEL]){
            summaryRecord[LEVEL_4] += h1bRecord[TOTAL_WORKERS]
        }else if(undefined != h1bRecord[TOTAL_WORKERS]){
            summaryRecord[UNSPECIFIED] += h1bRecord[TOTAL_WORKERS]
        }
        if(0 <= h1bRecord[TOTAL_WORKERS]
                && undefined != h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY]){
            const arr = Array(h1bRecord[TOTAL_WORKERS])
                    .fill(h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY])
            summaryRecord.wageArray = summaryRecord.wageArray.concat(arr)
        }
    })
    Object.assign(summaryRecord.wageArray, findLevels(summaryRecord.wageArray))
    summaryRecord.percentiles = findLevels(summaryRecord.wageArray)
    logger.trace("summaryRecord: " + JSON.stringify(summaryRecord, undefined, 2))
    logger.trace("percentiles: " + JSON.stringify(summaryRecord.percentiles, undefined, 2))
    return summaryRecord
}

const createKey = (query) => {
    logger.trace('running createKey');
    var key = query[YEAR]
    delete query[YEAR]
    if(undefined != query[EMPLOYER_NAME]){
        key += "_" + query[EMPLOYER_NAME]
        delete query[EMPLOYER_NAME]
    }

    if(undefined != query[WORKSITE_STATE]){
        key += "_" + query[WORKSITE_STATE]
        delete query[WORKSITE_STATE]
    }

    if(undefined != query[WORKSITE_COUNTY]){
        key += "_" + query[WORKSITE_COUNTY]
        delete query[WORKSITE_COUNTY]
    }

    if(!_.isEmpty(query))
        return null
    return _.replace(key, / /g, '_')
}

const findLevels = (salaryArray) => {
    logger.trace('running findLevels');
    salaryArray.sort((a, b) => a - b)
    const length = salaryArray.length
    if(0 == length)
        return {}

    var returnStruct = {}
    for(var i = 0; i < salaryLevels.length; ++i){
        const salaryLevel = salaryLevels[i]
        var index = salaryLevel * 100 + '%'
        returnStruct[index] = salaryArray[Math.round((length - 1) * salaryLevel)]
        logger.trace(chalk.yellow(index) + ' ' + chalk.red.bold(returnStruct[index]))
    }
    return returnStruct
}

const countItems = (array, search) => {
    if(undefined == array)
        return 0
    var total = 0;
    for(var i = 0; i < array.length; ++i){
        if(search == array[i])
            ++total;
    }
    return total
}

module.exports = { summarize, createKey, findLevels, countItems }