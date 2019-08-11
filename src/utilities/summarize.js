const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const _ = require('lodash')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
        WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
        UNSPECIFIED, h1bRecord } 
            = require('../models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('../models/dbRecords')
const logger = log4js.getLogger('h1bData');

const summarize = (h1bRecords) => {

    var summaryRecord = {}
    summaryRecord[TOTAL_WORKERS] = 0
    summaryRecord[TOTAL_LCAS] = h1bRecords.length
    summaryRecord[LEVEL_1] = 0
    summaryRecord[LEVEL_2] = 0
    summaryRecord[LEVEL_3] = 0
    summaryRecord[LEVEL_4] = 0
    summaryRecord[UNSPECIFIED] = 0

    
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

    })

    return summaryRecord
}

const createKey = (query) => {
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

module.exports = { summarize, createKey }