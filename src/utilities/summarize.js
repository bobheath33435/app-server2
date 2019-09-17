const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')

var summaryMap = {}

const log = console.log
const { compress, decompress } = require('./compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
        WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
        LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        H1B_DEPENDENT, NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
        NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
        UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
        percentileLevels, h1bRecord } 
            = require('../models/h1bRecordSchema')
const years = [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]



log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

// Summarize data from h1bRecords

const summarizeAndCompress = (h1bRecords, query) => {
    var summaryRecord = summarize(h1bRecords, query)
    summaryRecord = compressSummaryRecord(summaryRecord)
    return summaryRecord
}

const summarize = (h1bRecords, query) => {
    logger.trace('running summarize');
    var summaryRecord = summarizeMajor(h1bRecords, query)
    // summaryRecord = summarizeMinor(h1bRecords, summaryRecord)
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
            updateWageMap(occupation.data.wageMap, h1bRecord)
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
            updateWageMap(summaryRecord.wageMap, h1bRecord)
        }
        processLatLng(summaryRecord, h1bRecord)
    })
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
        }
    })
    summaryRecord.occupations = occupations
    summaryRecord.latLngMap = sortLatLngRecords(summaryRecord.latLngMap)
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
            logger.trace(chalk.bgRed(`h1bRecord: ${JSON.stringify(h1bRecord, undefined, 2)}`))
            currentH1bRecord = h1bRecord
            // processLatLng(summaryRecord, h1bRecord)
        //     if(_.isNumber(h1bRecord[WORKSITE_LATITUDE]) && 
        //                  _.isNumber(h1bRecord[WORKSITE_LONGITUDE]) &&
        //                  !_.isEmpty(h1bRecord[EMPLOYER_NAME])){
        //         var key = h1bRecord[WORKSITE_LATITUDE] + '_' + h1bRecord[WORKSITE_LONGITUDE]
        //         key = key.replace(/[\s\.,]+/g, '')
        //         const latLngMap = summaryRecord.latLngMap
        //         var latLngItem = latLngMap[key]
        //         if(undefined == latLngItem){
        //             latLngItem = { "count": 0,
        //                             "lat": h1bRecord[WORKSITE_LATITUDE],
        //                             "lng": h1bRecord[WORKSITE_LONGITUDE], 
        //                             "instanceMap" : {} }
        //             latLngMap[key] = latLngItem
        //         }
        //         latLngItem.count += 1
        //         var h1bInstKey = h1bRecord[EMPLOYER_NAME]
        //         const addr1 = h1bRecord[WORKSITE_ADDR1]
        //         h1bInstKey += (undefined == addr1) ? "" : addr1
        //         const addr2 = h1bRecord[WORKSITE_ADDR2]
        //         h1bInstKey += (undefined == addr2) ? "" : addr2
        //         h1bInstKey = h1bInstKey.replace(/[\s\.,]+/g, '')
        //         var h1bInstance = latLngItem.instanceMap[h1bInstKey]
        //         if(undefined == h1bInstance){
        //             h1bInstance = _.pick(h1bRecord,
        //                 EMPLOYER_NAME,
        //                 WORKSITE_ADDR1, 
        //                 WORKSITE_ADDR2, 
        //                 WORKSITE_CITY,
        //                 WORKSITE_COUNTY,
        //                 WORKSITE_STATE) 
        //             h1bInstance.count = 0
        //             h1bInstance.instanceArray = []
        //             latLngItem.instanceMap[h1bInstKey] = h1bInstance
        //         }
        
        //         var workerData = _.pick(h1bRecord,
        //                                 CASE_NUMBER,
        //                                 SOC_CODE,
        //                                 TOTAL_WORKERS,
        //                                 H1B_DEPENDENT,
        //                                 ANNUALIZED_WAGE_RATE_OF_PAY)
        //         h1bInstance.count += 1
        //         h1bInstance.instanceArray.push(workerData)                 
        //     }
        })  
        // sort lat lng map by count
        summaryRecord.latLngMap = sortLatLngRecords(summaryRecord.latLngMap)
    }catch(e){
        logger.error(chalk.bgRed("Error building latitude longitude map: " + e))
        logger.error(chalk.bgRed("Stack: " + e.stack))
        logger.error(chalk.bgRed(`JSON: ${JSON.stringify(currentH1bRecord)}`))
    }
    logger.trace('completed running summarize minor');
    return summaryRecord
}

const sortLatLngRecords = (oldLatLngMap) => {
    var latLngKeys = Object.getOwnPropertyNames(oldLatLngMap)

    var newLatLngArray = []
    latLngKeys.forEach((key) => {
        var latLngItem = _.clone(oldLatLngMap[key])
        latLngItem.key = key
        newLatLngArray.push(latLngItem)
    })

    newLatLngArray = newLatLngArray.sort((a, b) => sortLatLng(a, b))
    var newLatLngMap = {}
    newLatLngArray.forEach((latLngItem) => {
        const key = latLngItem.key
        delete latLngItem.key
        latLngItem.instanceMap = sortH1BInstances(latLngItem.instanceMap)
        newLatLngMap[key] = latLngItem
    })
    return newLatLngMap
}

const sortH1BInstances = (oldLatLngInstanceMap) => {
    var h1bInstanceKeys = Object.getOwnPropertyNames(oldLatLngInstanceMap)

    var newH1bInstanceArray = []
    h1bInstanceKeys.forEach((key) => {
        var h1bInstanceItem = _.clone(oldLatLngInstanceMap[key])
        h1bInstanceItem.key = key
        newH1bInstanceArray.push(h1bInstanceItem)
    })

    newH1bInstanceArray = newH1bInstanceArray.sort((a, b) => sortInstanceKey(a, b))
    var newLatLngInstanceMap = {}
    newH1bInstanceArray.forEach((h1bInstanceItem) => {
        const key = h1bInstanceItem.key
        h1bInstanceItem.instanceArray =
                h1bInstanceItem.instanceArray.sort((a, b) => sortInstanceArray(a, b))
        delete h1bInstanceItem.key
        newLatLngInstanceMap[key] = h1bInstanceItem
    })

    return newLatLngInstanceMap
}

const processLatLng = (summaryRecord, h1bRecord) => {
    if(!_.isNumber(h1bRecord[WORKSITE_LATITUDE]) || 
                    !_.isNumber(h1bRecord[WORKSITE_LONGITUDE]) ||
                    _.isEmpty(h1bRecord[EMPLOYER_NAME])){
        return
    }

    var key = h1bRecord[WORKSITE_LATITUDE] + '_' + h1bRecord[WORKSITE_LONGITUDE]
    key = key.replace(/[\s\.,]+/g, '')
    const latLngMap = summaryRecord.latLngMap
    var latLngItem = latLngMap[key]
    if(undefined == latLngItem){
        latLngItem = { "count": 0,
                        "lat": h1bRecord[WORKSITE_LATITUDE],
                        "lng": h1bRecord[WORKSITE_LONGITUDE], 
                        "instanceMap" : {} }
        latLngMap[key] = latLngItem
    }
    latLngItem.count += 1
    var h1bInstKey = h1bRecord[EMPLOYER_NAME]
    const addr1 = h1bRecord[WORKSITE_ADDR1]
    h1bInstKey += (undefined == addr1) ? "" : addr1
    const addr2 = h1bRecord[WORKSITE_ADDR2]
    h1bInstKey += (undefined == addr2) ? "" : addr2
    h1bInstKey = h1bInstKey.replace(/[\s\.,]+/g, '')
    var h1bInstance = latLngItem.instanceMap[h1bInstKey]
    if(undefined == h1bInstance){
        h1bInstance = _.pick(h1bRecord,
            EMPLOYER_NAME,
            WORKSITE_ADDR1, 
            WORKSITE_ADDR2, 
            WORKSITE_CITY,
            WORKSITE_COUNTY,
            WORKSITE_STATE) 
        h1bInstance.count = 0
        h1bInstance.instanceArray = []
        latLngItem.instanceMap[h1bInstKey] = h1bInstance
    }

    var workerData = _.pick(h1bRecord,
                            CASE_NUMBER,
                            SOC_CODE,
                            TOTAL_WORKERS,
                            H1B_DEPENDENT,
                            ANNUALIZED_WAGE_RATE_OF_PAY)
    h1bInstance.count += 1
    h1bInstance.instanceArray.push(workerData)                 
}

const sortLatLng = (a, b) => {
    const aCount = a.count 
    const bCount = b.count 
    if(aCount != bCount)
        return(bCount - aCount)
    const aLat = a.lat
    const bLat = b.lat
    if(undefined == aLat && undefined == bLat)
        return 0
    if(undefined == aLat)
        return 1
    if(undefined == bLat)
        return -1
    if(aLat != bLat)
        return(bLat - aLat)
    const aLng = a.lng
    const bLng = b.lng
    if(undefined == aLng && undefined == bLng)
        return 0
    if(undefined == aLng)
        return 1
    if(undefined == bLng)
        return -1
    return bLng - aLng
}

const sortInstanceKey = (a, b) => {
    const aCount = a.count 
    const bCount = b.count 
    if(aCount != bCount)
        return(bCount - aCount)
    const aEmp = a[EMPLOYER_NAME]
    const bEmp = b[EMPLOYER_NAME]
    if(undefined == aEmp && undefined == bEmp)
        return 0
    if(undefined == aEmp)
        return 1
    if(undefined == bEmp)
        return -1
    if(aEmp != bEmp)
        return(aEmp > bEmp) ? -1 : 1 
    const aAd1 = a[WORKSITE_ADDR1]
    const bAd1 = b[WORKSITE_ADDR1]
    if(undefined == aAd1 && undefined == bAd1)
        return 0
    if(undefined == aAd1)
        return 1
    if(undefined == bAd1)
        return -1
    if(aAd1 != bAd1)
        return(aAd1 > bAd1) ? -1 : 1
    const aAd2 = a[WORKSITE_ADDR2]
    const bAd2 = b[WORKSITE_ADDR2]
    if(undefined == aAd2 && undefined == bAd2)
        return 0
    if(undefined == aAd2)
        return 1
    if(undefined == bAd2)
        return -1
    if(aAd2 != bAd2)
        return(aAd2 > bAd2) ? -1 : 1 
    return 0
}

const sortInstanceArray = (a, b) => {
    const aTw = a[TOTAL_WORKERS]
    const bTw = b[TOTAL_WORKERS]
    if(aTw != bTw)
        return bTw - aTw
    const aCn = a[CASE_NUMBER]
    const bCn = b[CASE_NUMBER]
    if(undefined == aCn && undefined == bCn)
        return 0
    if(undefined == aCn)
        return 1
    if(undefined == bCn)
        return -1
    if(aCn != bCn)
        return(aCn > bCn) ? -1 : 1 
    return 0
}

const compressSummaryRecord = (summaryRecord) => {
    const status = _.pick(summaryRecord, 
                          'categories',
                          'latLngMap',
                          'occupations',
                          'percentiles', 
                          'wageMap',
                          'wageLevels')
    const compressedStatus = compress(status)
    delete summaryRecord.categories
    delete summaryRecord.latLngMap
    delete summaryRecord.occupations
    delete summaryRecord.percentiles
    delete summaryRecord.wageMap
    delete summaryRecord.wageLevels
    summaryRecord.status = compressedStatus
    return summaryRecord
}

const decompressSummaryRecord = (summaryRecord) => {
    const status = decompress(summaryRecord.status)
    summaryRecord.categories = status.categories
    summaryRecord.latLngMap = status.latLngMap
    summaryRecord.occupations = status.occupations
    summaryRecord.percentiles = status.percentiles
    summaryRecord.wageMap = status.wageMap
    summaryRecord.wageLevels = status.wageLevels
    delete summaryRecord.status
    
    return summaryRecord
}

const createKey = (queryIn) => {
    var query = _.clone(queryIn, true)
    logger.trace('running createKey');
    var key = query[YEAR]
    delete query[YEAR]
    if(undefined != query[EMPLOYER_NAME]){
        key += "_emp_" + query[EMPLOYER_NAME]
        delete query[EMPLOYER_NAME]
    }

    if(undefined != query[WORKSITE_STATE]){
        key += "_wst_" + query[WORKSITE_STATE]
        delete query[WORKSITE_STATE]
    }

    if(undefined != query[WORKSITE_CITY]){
        key += "_wcity_" + query[WORKSITE_CITY]
        delete query[WORKSITE_CITY]
    }

    if(undefined != query[WORKSITE_COUNTY]){
        key += "_wcounty_" + query[WORKSITE_COUNTY]
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
    logger.trace("SummaryMap size: " + Object.getOwnPropertyNames(summaryMap).length)
    return Promise.resolve(summaryMap)
}

module.exports = { 
                   summarize,
                   summarizeAndCompress,
                   compressSummaryRecord,
                   decompressSummaryRecord,
                   createKey,
                   calculatePercentiles,
                   countItems,
                   buildWageArray,
                   readSummarizedQueries,
                   sortLatLng,
                   sortInstanceKey,
                   sortInstanceArray,
                   summaryMap,
                   years
                 }