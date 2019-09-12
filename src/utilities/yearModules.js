const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const si = require('systeminformation')
const moment = require('moment')
const _ = require('lodash')

const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('../models/h1bRecordSchema')
const { summarizeAndCompress, createKey, calculatePercentiles, years,
        compressSummaryRecord, decompressSummaryRecord } = require('./summarize')

const log = console.log;

const initYearObject = (year) => {

    yearObject = {}
    yearObject[YEAR] = year
    yearObject[TOTAL_LCAS] = 0
    yearObject[TOTAL_WORKERS] = 0
    yearObject.categories = {}
    yearObject.categories[NEW_EMPLOYMENT] = 0
    yearObject.categories[CONTINUED_EMPLOYMENT] = 0
    yearObject.categories[CHANGE_PREVIOUS_EMPLOYMENT] = 0
    yearObject.categories[NEW_CONCURRENT_EMPLOYMENT] = 0
    yearObject.categories[CHANGE_EMPLOYER] = 0
    yearObject.categories[AMENDED_PETITION] = 0
    yearObject.wageLevels = {}
    yearObject.wageLevels.lcas = {}
    yearObject.wageLevels.lcas[LEVEL_1] = 0
    yearObject.wageLevels.lcas[LEVEL_2] = 0
    yearObject.wageLevels.lcas[LEVEL_3] = 0
    yearObject.wageLevels.lcas[LEVEL_4] = 0
    yearObject.wageLevels.lcas[UNSPECIFIED] = 0
    yearObject.wageLevels.workers = {}
    yearObject.wageLevels.workers[LEVEL_1] = 0
    yearObject.wageLevels.workers[LEVEL_2] = 0
    yearObject.wageLevels.workers[LEVEL_3] = 0
    yearObject.wageLevels.workers[LEVEL_4] = 0
    yearObject.wageLevels.workers[UNSPECIFIED] = 0
    yearObject.occupations = {}

    return yearObject
}

const mergeStateObjects = (yearH1bObject, stateH1bObject) => {
    if(_.isEmpty(stateH1bObject)){
        throw(`Empty H1B object for year ${year}`)
    }else{
        if(!_.isEmpty(stateH1bObject.status)){
            stateH1bObject = decompressSummaryRecord(stateH1bObject)
        }
        yearH1bObject.TOTAL_LCAS += stateH1bObject.TOTAL_LCAS
        yearH1bObject.TOTAL_WORKERS += stateH1bObject.TOTAL_WORKERS

        yearH1bObject.categories[NEW_EMPLOYMENT] += stateH1bObject.categories[NEW_EMPLOYMENT]
        yearH1bObject.categories[CONTINUED_EMPLOYMENT] += stateH1bObject.categories[CONTINUED_EMPLOYMENT]
        yearH1bObject.categories[CHANGE_PREVIOUS_EMPLOYMENT] += stateH1bObject.categories[CHANGE_PREVIOUS_EMPLOYMENT]
        yearH1bObject.categories[NEW_CONCURRENT_EMPLOYMENT] += stateH1bObject.categories[NEW_CONCURRENT_EMPLOYMENT]
        yearH1bObject.categories[CHANGE_EMPLOYER] += stateH1bObject.categories[CHANGE_EMPLOYER]
        yearH1bObject.categories[AMENDED_PETITION] += stateH1bObject.categories[AMENDED_PETITION]
    
        yearH1bObject.wageLevels.lcas[LEVEL_1] += stateH1bObject.wageLevels.lcas[LEVEL_1]
        yearH1bObject.wageLevels.lcas[LEVEL_2] += stateH1bObject.wageLevels.lcas[LEVEL_2]
        yearH1bObject.wageLevels.lcas[LEVEL_3] += stateH1bObject.wageLevels.lcas[LEVEL_3]
        yearH1bObject.wageLevels.lcas[LEVEL_4] += stateH1bObject.wageLevels.lcas[LEVEL_4]
        yearH1bObject.wageLevels.lcas[UNSPECIFIED] += stateH1bObject.wageLevels.lcas[UNSPECIFIED]
    
        yearH1bObject.wageLevels.workers[LEVEL_1] += stateH1bObject.wageLevels.workers[LEVEL_1]
        yearH1bObject.wageLevels.workers[LEVEL_2] += stateH1bObject.wageLevels.workers[LEVEL_2]
        yearH1bObject.wageLevels.workers[LEVEL_3] += stateH1bObject.wageLevels.workers[LEVEL_3]
        yearH1bObject.wageLevels.workers[LEVEL_4] += stateH1bObject.wageLevels.workers[LEVEL_4]
        yearH1bObject.wageLevels.workers[UNSPECIFIED] += stateH1bObject.wageLevels.workers[UNSPECIFIED]

        // var query = _.clone(queryIn, true)
        const stateOccupations = stateH1bObject.occupations
        var mergeOccupations = yearH1bObject.occupations
        const stateOccArray = Object.getOwnPropertyNames(stateOccupations)
        stateOccArray.forEach((stateOccCode) => {
            const stateOccupation = stateOccupations[stateOccCode]
            var stateWageMap = stateOccupation.data.wageMap
            if(_.isEmpty(mergeOccupations[stateOccCode])){
                mergeOccupations[stateOccCode] = 
                    { 
                        // "data": _.pick(stateOccupation.data, "SOC_CODE", "wageMap")
                        "data": {"SOC_CODE": stateOccCode, 
                                        percentiles: {},
                                        wageMap: stateOccupation.data.wageMap
                                }
                    }
                    // mergeOccupations[stateOccCode] = _.clone(stateOccupation)
            }else{
                const stateWageMapArray = Object.getOwnPropertyNames(stateWageMap)
                mergeWageMap = mergeOccupations[stateOccCode].data.wageMap
                stateWageMapArray.forEach((stateWageKey) => {
                    if(_.isEmpty(mergeWageMap[stateWageKey])){
                        const x = stateWageMap[stateWageKey]
                        mergeWageMap[stateWageKey] = stateWageMap[stateWageKey]
                    }else{
                        const x = stateWageMap[stateWageKey]
                        mergeWageMap[stateWageKey] += stateWageMap[stateWageKey]
                    }
                })
                mergeOccupations[stateOccCode].data.wageMap = mergeWageMap
            }
        })

        yearH1bObject.occupations = mergeOccupations 
    }

    return yearH1bObject
}

const finalizeMerge = (yearH1bObject) => {
    const occupationKeysArray = Object.getOwnPropertyNames(yearH1bObject.occupations)
    occupationKeysArray.forEach((occupationKey) => {
        const occupation = yearH1bObject.occupations[occupationKey]
        var data = occupation.data
        data.percentiles = calculatePercentiles(data.wageMap)
    })
    return yearH1bObject
}

module.exports = { initYearObject, mergeStateObjects, finalizeMerge }