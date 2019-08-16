const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')

const log = console.log;
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
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
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

// Summarize data from h1bRecords

const summarize = (h1bRecords, query) => {
    logger.trace('running summarize');
    var summaryRecord = summarizeMajor(h1bRecords, query)
    summaryRecord = summarizeMinor(h1bRecords, summaryRecord)
    return summaryRecord
}

const summarizeMajor = (h1bRecords, query) => {

    logger.trace('running summarize major');
    var summaryRecord = {}
    logger.trace(query)
    const year = query['YEAR']
    const employer = query['EMPLOYER']
    const city = query['WORKSITE_CITY']
    const county = query["WORKSITE_COUNTY"]
    const state = query['WORKSITE_STATE']
    if(undefined != year){
        summaryRecord['YEAR'] = year
    }
    if(undefined != employer){
        summaryRecord['EMPLOYER'] = employer
    }
    if(undefined != county){
        summaryRecord['WORKSITE_CITY'] = city
    }
    if(undefined != county){
        summaryRecord['WORKSITE_COUNTY'] = county
    }
    if(undefined != state){
        summaryRecord['WORKSITE_STATE'] = state
    }
    summaryRecord[TOTAL_LCAS] = h1bRecords.length
    summaryRecord[TOTAL_WORKERS] = 0
    summaryRecord.categories = {}
    summaryRecord.occupations = {}
    summaryRecord.percentiles = {}
    summaryRecord.wageArray = []
    summaryRecord.wageLevels = { "workers": {}, "lcas": {}}
    summaryRecord.wageLevels.workers[LEVEL_1] = 0
    summaryRecord.wageLevels.workers[LEVEL_2] = 0
    summaryRecord.wageLevels.workers[LEVEL_3] = 0
    summaryRecord.wageLevels.workers[LEVEL_4] = 0
    summaryRecord.wageLevels.workers[UNSPECIFIED] = 0
    summaryRecord.wageLevels.lcas[LEVEL_1] = 0
    summaryRecord.wageLevels.lcas[LEVEL_2] = 0
    summaryRecord.wageLevels.lcas[LEVEL_3] = 0
    summaryRecord.wageLevels.lcas[LEVEL_4] = 0
    summaryRecord.wageLevels.lcas[UNSPECIFIED] = 0
    summaryRecord.categories[NEW_EMPLOYMENT] = 0
    summaryRecord.categories[CONTINUED_EMPLOYMENT] = 0
    summaryRecord.categories[CHANGE_PREVIOUS_EMPLOYMENT] = 0
    summaryRecord.categories[NEW_CONCURRENT_EMPLOYMENT] = 0
    summaryRecord.categories[CHANGE_EMPLOYER] = 0
    summaryRecord.categories[AMENDED_PETITION] = 0

    h1bRecords.forEach( (h1bRecord, index ) => {
        debugger
        if(undefined != h1bRecord[TOTAL_WORKERS]){
            summaryRecord[TOTAL_WORKERS] += h1bRecord[TOTAL_WORKERS]
        }

        const socCode = h1bRecord.SOC_CODE
        if(undefined != socCode){
            const socKey = _.replace(h1bRecord.SOC_CODE, /\./, '-')
            var occupations = summaryRecord.occupations
            var occupation = occupations[socCode]
            var props = Object.getOwnPropertyNames(summaryRecord.occupations)
            logger.trace(chalk.bgRed.bold("properties: ", props))
            if(undefined == occupation){
                occupation  = {}
                occupations[socKey] = occupation
                occupation.data = {"SOC_CODE": socCode, "percentiles": {}, "wageArray": []}
            }
            const arr = Array(h1bRecord[TOTAL_WORKERS])
                    .fill(h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY])
    
            occupation.data.wageArray = occupation.data.wageArray.concat(arr)    
        }
    
        if(LEVEL_1 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevels.workers[LEVEL_1] += h1bRecord[TOTAL_WORKERS]
            summaryRecord.wageLevels.lcas[LEVEL_1] += 1
        }else if(LEVEL_2 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevels.workers[LEVEL_2] += h1bRecord[TOTAL_WORKERS]
            summaryRecord.wageLevels.lcas[LEVEL_2] += 1
        }else if(LEVEL_3 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevels.workers[LEVEL_3] += h1bRecord[TOTAL_WORKERS]
            summaryRecord.wageLevels.lcas[LEVEL_3] += 1
        }else if(LEVEL_4 == h1bRecord[WAGE_LEVEL]){
            summaryRecord.wageLevels.workers[LEVEL_4] += h1bRecord[TOTAL_WORKERS]
            summaryRecord.wageLevels.lcas[LEVEL_4] += 1
        }else if(undefined != h1bRecord[TOTAL_WORKERS]){
            summaryRecord.wageLevels.workers[UNSPECIFIED] += h1bRecord[TOTAL_WORKERS]
            summaryRecord.wageLevels.lcas[UNSPECIFIED] += 1
        }
        if(undefined != h1bRecord[NEW_EMPLOYMENT]){
            summaryRecord.categories[NEW_EMPLOYMENT] += h1bRecord[NEW_EMPLOYMENT]
        }
        if(undefined != h1bRecord[CONTINUED_EMPLOYMENT]){
            summaryRecord.categories[CONTINUED_EMPLOYMENT] += h1bRecord[CONTINUED_EMPLOYMENT]
        }
        if(undefined != h1bRecord[CHANGE_PREVIOUS_EMPLOYMENT]){
            summaryRecord.categories[CHANGE_PREVIOUS_EMPLOYMENT] += h1bRecord[CHANGE_PREVIOUS_EMPLOYMENT]
        }
        if(undefined != h1bRecord[NEW_CONCURRENT_EMPLOYMENT]){
            summaryRecord.categories[NEW_CONCURRENT_EMPLOYMENT] += h1bRecord[NEW_CONCURRENT_EMPLOYMENT]
        }
        if(undefined != h1bRecord[CHANGE_EMPLOYER]){
            summaryRecord.categories[CHANGE_EMPLOYER] += h1bRecord[CHANGE_EMPLOYER]
        }
        if(undefined != h1bRecord[AMENDED_PETITION]){
            summaryRecord.categories[AMENDED_PETITION] += h1bRecord[AMENDED_PETITION]
        }
    
        if(0 <= h1bRecord[TOTAL_WORKERS]
                && undefined != h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY]){
            const arr = Array(h1bRecord[TOTAL_WORKERS])
                    .fill(h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY])
            summaryRecord.wageArray = summaryRecord.wageArray.concat(arr)
        }
    })
    Object.assign(summaryRecord.wageArray, findLevels(summaryRecord.wageArray))
    summaryRecord.wageArray = summaryRecord.wageArray.sort((a, b) => a - b)
    summaryRecord.percentiles = findLevels(summaryRecord.wageArray)
    var socKeys = Object.getOwnPropertyNames(summaryRecord.occupations)
    socKeys = socKeys.sort()
    logger.trace(chalk.bgRed.bold("properties: ", socKeys))
    var occupations = {}
    socKeys.forEach((socKey) => {
        logger.trace(chalk.bgRed.bold(socKey))
        const occupation = summaryRecord.occupations[socKey]
        occupations[socKey] = occupation
        delete summaryRecord.occupations[socKey]
        const data = occupation.data
        if(undefined != data && undefined != data.wageArray){
            data.percentiles = findLevels(data.wageArray)
            data.wageArray = data.wageArray.sort((a, b) => a - b)
        }
    })
    summaryRecord.occupations = occupations
    logger.trace("summaryRecord: " + JSON.stringify(summaryRecord, undefined, 2))
    logger.trace("percentiles: " + JSON.stringify(summaryRecord.percentiles, undefined, 2))
    return summaryRecord
}

const summarizeMinor = (h1bRecords, summaryRecord) => {
    logger.trace('running summarize minor');
    return summaryRecord
}

const createKey = (queryIn) => {
    var query = _.clone(queryIn, true)
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