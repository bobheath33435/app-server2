const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')

var summaryMap = {}

const log = console.log;
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
        WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
        LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        H1B_DEPENDENT, NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
        NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
        UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
        percentileLevels, h1bRecord } 
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
    logger.trace('completed running summarize');
    return summaryRecord
}

const summarizeMajor = (h1bRecords, query) => {

    logger.trace('running summarize major');
    var summaryRecord = {}
    logger.trace(query)
    const year = query[YEAR]
    const employer = query[EMPLOYER_NAME]
    const city = query[WORKSITE_CITY]
    const county = query[WORKSITE_COUNTY]
    const state = query[WORKSITE_STATE]
    const congDistrict = query[WORKSITE_CONGRESS_DISTRICT]
    if(_.isNumber(year)){
        summaryRecord[YEAR] = year
    }
    if(!_.isEmpty(employer)){
        summaryRecord[EMPLOYER_NAME] = employer
    }
    if(!_.isEmpty(city)){
        summaryRecord[WORKSITE_CITY] = city
    }
    if(!_.isEmpty(county)){
        summaryRecord[WORKSITE_COUNTY] = county
    }
    if(!_.isEmpty(state)){
        summaryRecord[WORKSITE_STATE] = state
    }
    if(_.isNumber(congDistrict)){
        summaryRecord[WORKSITE_CONGRESS_DISTRICT] = congDistrict
    }
    summaryRecord[TOTAL_LCAS] = h1bRecords.length
    summaryRecord[TOTAL_WORKERS] = 0
    summaryRecord.categories = {}
    summaryRecord.latLngMap = {}
    summaryRecord.occupations = {}
    summaryRecord.percentiles = {}
    summaryRecord.wageMap = {}
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
        if(undefined != h1bRecord[TOTAL_WORKERS]){
            summaryRecord[TOTAL_WORKERS] += h1bRecord[TOTAL_WORKERS]
        }

        const socCode = h1bRecord.SOC_CODE
        if(undefined != socCode){
            const socKey = _.replace(h1bRecord.SOC_CODE, /\./g, '-')
            var occupations = summaryRecord.occupations
            var occupation = occupations[socCode]
            var props = Object.getOwnPropertyNames(summaryRecord.occupations)
            logger.trace(chalk.bgRed.bold("properties: ", props))
            if(undefined == occupation){
                occupation  = {}
                occupations[socKey] = occupation
                occupation.data = {"SOC_CODE": socCode, "percentiles": {}, "wageMap": {}}
            }
            // var wageMap = occupation.data.wageMap
            // const wages = h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY]
            // const count = h1bRecord[TOTAL_WORKERS]
            // if(undefined == wageMap[wages]){
            //     wageMap[wages] = count
            // }else{
            //     wageMap[wages] += count
            // }

            updateWageMap(occupation.data.wageMap, h1bRecord)
            // // const wageArrayEntry = _.pick(h1bRecord, TOTAL_WORKERS, ANNUALIZED_WAGE_RATE_OF_PAY)    
            // occupation.data.wageArray.push(wageArrayEntry)    
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
            // const arr = Array(h1bRecord[TOTAL_WORKERS])
                    // .fill(h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY])
            // summaryRecord.wageArray = summaryRecord.wageArray.concat(arr)
            // const wageArrayEntry = _.pick(h1bRecord, TOTAL_WORKERS, ANNUALIZED_WAGE_RATE_OF_PAY)    
            // summaryRecord.wageArray.push(wageArrayEntry)    
            updateWageMap(summaryRecord.wageMap, h1bRecord)
        }
    })
    // Object.assign(summaryRecord.wageArray, calculatePercentiles(summaryRecord.wageArray))
    // summaryRecord.wageArray = summaryRecord.wageArray.sort((a, b) => a - b)
    summaryRecord.percentiles = calculatePercentiles(summaryRecord.wageMap)
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
        if(undefined != data && undefined != data.wageMap){
            data.percentiles = calculatePercentiles(data.wageMap)
            // data.wageArray = data.wageArray.sort((a, b) => a - b)
        }
    })
    summaryRecord.occupations = occupations
    logger.trace("summaryRecord: " + JSON.stringify(summaryRecord, undefined, 2))
    logger.trace("percentiles: " + JSON.stringify(summaryRecord.percentiles, undefined, 2))
    return summaryRecord
}

const updateWageMap = (wageMap, h1bRecord) => {
    var wages = "" + h1bRecord[ANNUALIZED_WAGE_RATE_OF_PAY]
    wages = wages.replace(/\./g, 'X')
    const count = h1bRecord[TOTAL_WORKERS]
    if(undefined == wageMap[wages]){
        wageMap[wages] = count
    }else{
        wageMap[wages] += count
    }
}    

const summarizeMinor = (h1bRecords, summaryRecord) => {
    logger.trace('running summarize minor');
    var latLngMap = {}
    var currentH1bRecord = {}
    try{
        h1bRecords.forEach((h1bRecord, index) => {
            currentH1bRecord = h1bRecord
            var key = h1bRecord[WORKSITE_LATITUDE] + '_' + h1bRecord[WORKSITE_LONGITUDE]
            key = key.replace(/[\s\.,]+/g, '')
            const latLngMap = summaryRecord.latLngMap
            var latLngItem = latLngMap[key]
            if(undefined == latLngItem){
                latLngItem = { "latitude": h1bRecord[WORKSITE_LATITUDE],
                               "longitude": h1bRecord[WORKSITE_LONGITUDE], 
                               "h1bInstances" : {} }
                latLngMap[key] = latLngItem
            }
            var h1bInstKey = h1bRecord[EMPLOYER_NAME] + h1bRecord[WORKSITE_ADDR1]
            const addr2 = h1bRecord[WORKSITE_ADDR2]
            h1bInstKey += (undefined == addr2) ? "" : addr2
            h1bInstKey = h1bInstKey.replace(/[\s\.,]+/g, '')
            var h1bInstance = latLngItem.h1bInstances[h1bInstKey]
            if(undefined == h1bInstance){
                h1bInstance = _.pick(h1bRecord,
                    EMPLOYER_NAME,
                    WORKSITE_ADDR1, 
                    WORKSITE_ADDR2, 
                    WORKSITE_CITY,
                    WORKSITE_COUNTY,
                    WORKSITE_STATE) 
                h1bInstance.instanceArray = []
                latLngItem.h1bInstances[h1bInstKey] = h1bInstance
            }
    
            var workerData = _.pick(h1bRecord,
                                    CASE_NUMBER,
                                    SOC_CODE,
                                    TOTAL_WORKERS,
                                    H1B_DEPENDENT,
                                    ANNUALIZED_WAGE_RATE_OF_PAY)
            h1bInstance.instanceArray.push(workerData)      
        })    
    }catch(e){
        logger.error(chalk.bgRed("Error building latitude longitude map: " + e))
        logger.errorr(chalk.bgRed(`JSON: ${JSON.stringify(currentH1bRecord)}`))
    }
    logger.trace('completed running summarize minor');
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

    if(undefined != query[WORKSITE_CITY]){
        key += "_" + query[WORKSITE_CITY]
        delete query[WORKSITE_CITY]
    }

    if(undefined != query[WORKSITE_COUNTY]){
        key += "_" + query[WORKSITE_COUNTY]
        delete query[WORKSITE_COUNTY]
    }

    if(undefined != query[WORKSITE_CONGRESS_DISTRICT]){
        key += "_" + query[WORKSITE_CONGRESS_DISTRICT]
        delete query[WORKSITE_CONGRESS_DISTRICT]
    }

    if(!_.isEmpty(query))
        return null
    return _.replace(key, / /g, '_')
}

const calculatePercentiles = (wageMap) => {
    logger.trace('running calculatePercentiles');
    // var salaryArray = []
    // wageArrayEntries.forEach((wageArrayEntry) => {
    //     const arr =  Array(wageArrayEntry[TOTAL_WORKERS])
    //             .fill(wageArrayEntry[ANNUALIZED_WAGE_RATE_OF_PAY])
    //     salaryArray = salaryArray.concat(arr)
    // })
    // salaryArray.sort((a, b) => a - b)
    const salaryArray = buildWageArray(wageMap)
    const length = salaryArray.length
    if(0 == length)
        return {}

    var returnStruct = {}
    for(var i = 0; i < percentileLevels.length; ++i){
        const percentileLevel = percentileLevels[i]
        var index = percentileLevel * 100 + '%'
        returnStruct[index] = salaryArray[Math.round((length - 1) * percentileLevel)]
        logger.trace(chalk.yellow(index) + ' ' + chalk.red.bold(returnStruct[index]))
    }
    return returnStruct
}

const buildWageArray = (wageMap) => {
    var salaries = Object.getOwnPropertyNames(wageMap)
    var salaryArray = []
    salaries.forEach((salaryX) => {
        const salary = salaryX.replace(/X/g, '.')
        const arr =  Array(wageMap[salary]).fill(Number(salary))
        salaryArray = salaryArray.concat(arr)
    })
    salaryArray.sort((a, b) => a - b)
    return salaryArray
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

const readSummarizedQueries = async() => {
    const projection = { _id: 0, "key": 1 }
    const summaryModel = modelMap['summary']
    const summaryQuery = {}

    const keys = await summaryModel.find(summaryQuery, projection)
    keys.forEach((key) => {
        summaryMap[key['key']] = true
    })
    
    logger.trace(keys)
    logger.trace(summaryMap)
}


module.exports = { summarize,
                   summarizeMajor,
                   createKey,
                   calculatePercentiles,
                   countItems,
                   buildWageArray,
                   readSummarizedQueries,
                   summaryMap
                 }