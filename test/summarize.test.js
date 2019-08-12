const log4js = require('log4js')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const log = console.log;
const logger = log4js.getLogger('h1bData');
const chalk = require('chalk')
const expect = require('chai').expect
const _ = require('lodash')
const { summarize, createKey, findLevels, countItems } 
        = require('../src/utilities/summarize')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

describe('Test createKey', () => {
    logger.trace('testing createKey');
    it('1) createKey should create a key with {"YEAR": "xyz"}', () => {
        const key = createKey({'YEAR': "xyz"})
        expect("xyz").to.equal(key)
    })
    
    it('2) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA"}', () => {
        const key = createKey({"YEAR": "xyz", "WORKSITE_STATE": "CA"})
        expect("xyz_CA").to.equal(key)
    })  
    
    it('3) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA", "WORKSITE_COUNTY": "SANTA CLARA ABC"}', () => {
        const key = createKey({"YEAR": "xyz", 
            "WORKSITE_STATE": "CA",
            "WORKSITE_COUNTY": "SANTA CLARA ABC"})
        expect("xyz_CA_SANTA_CLARA_ABC").to.equal(key)
    })
    
    it('4) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA", "WORKSITE_COUNTY": "SANTA CLARA ABC", "WORKSITE_CITY": "SAN JOSE"}', () => {
        const key = createKey({"YEAR": "xyz", 
            "WORKSITE_STATE": "CA",
            "WORKSITE_COUNTY": "SANTA CLARA ABC",
            "WORKSITE_CITY": "SAN JOSE"
        })
        expect(null).to.equal(key)
    })             
})

describe('Test summarize', () => {
    logger.trace('testing summarize');
    var h1bRecords = [
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 2, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 150, SOC_CODE: "123"},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 3, CONTINUED_EMPLOYMENT: 3,
            ANNUALIZED_WAGE_RATE_OF_PAY: 500, SOC_CODE: "abc"},
        {WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 5, CHANGE_PREVIOUS_EMPLOYMENT: 7,
            ANNUALIZED_WAGE_RATE_OF_PAY: 600, SOC_CODE: "xyz"},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 7, NEW_CONCURRENT_EMPLOYMENT: 1, CONTINUED_EMPLOYMENT: 4000,
            ANNUALIZED_WAGE_RATE_OF_PAY: 400, SOC_CODE: "xyz"},
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 11, CHANGE_EMPLOYER: 14, AMENDED_PETITION: 77,
            ANNUALIZED_WAGE_RATE_OF_PAY: 200, SOC_CODE: "abc"},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 17,  NEW_EMPLOYMENT: 7,
            ANNUALIZED_WAGE_RATE_OF_PAY: 300, SOC_CODE: "123"},
        {TOTAL_WORKERS: 23, AMENDED_PETITION: 5,
            ANNUALIZED_WAGE_RATE_OF_PAY: 10000, SOC_CODE: "123"},
        {},
        {CASE_NUMBER: "12345"}
    ]

    beforeEach(() => {
    })
    
    it('1) summarize should summarize h1bRecords', () => {
        const summary = summarize(h1bRecords)
        expect(68).to.equal(summary.wageArray.length)
        logger.trace("summary: " + JSON.stringify(summary, undefined, 2))
        var count = countItems(summary.wageArray, 150)
        expect(2).to.equal(count)
        logger.trace("count for 200: " + count)
        count = countItems(summary.wageArray, 200)
        expect(11).to.equal(count)
        count = countItems(summary.wageArray, 300)
        logger.trace("count for 300: " + count)
        expect(17).to.equal(count)
        count = countItems(summary.wageArray, 600)
        expect(5).to.equal(count)
        count = countItems(summary.wageArray, 500)
        expect(3).to.equal(count)
        count = countItems(summary.wageArray, 400)
        expect(7).to.equal(count)
        count = countItems(summary.wageArray, 10000)
        expect(23).to.equal(count)

        expect(150).to.equal(summary.percentiles['0%'])
        expect(200).to.equal(summary.percentiles['10%'])
        expect(300).to.equal(summary.percentiles['25%'])
        expect(400).to.equal(summary.percentiles['50%'])
        expect(10000).to.equal(summary.percentiles['75%'])
        expect(10000).to.equal(summary.percentiles['90%'])
        expect(10000).to.equal(summary.percentiles['100%'])

        expect(13).to.equal(summary.wageLevels.workers[LEVEL_1])
        expect(2).to.equal(summary.wageLevels.lcas[LEVEL_1])
        expect(20).to.equal(summary.wageLevels.workers[LEVEL_2])
        expect(2).to.equal(summary.wageLevels.lcas[LEVEL_2])
        expect(5).to.equal(summary.wageLevels.workers[LEVEL_3])
        expect(1).to.equal(summary.wageLevels.lcas[LEVEL_3])
        expect(7).to.equal(summary.wageLevels.workers[LEVEL_4])
        expect(1).to.equal(summary.wageLevels.lcas[LEVEL_4])
        expect(23).to.equal(summary.wageLevels.workers[UNSPECIFIED])
        expect(1).to.equal(summary.wageLevels.lcas[UNSPECIFIED])
        
        expect(12).to.equal(summary.categories[NEW_EMPLOYMENT])
        expect(4003).to.equal(summary.categories[CONTINUED_EMPLOYMENT])
        expect(8).to.equal(summary.categories[CHANGE_PREVIOUS_EMPLOYMENT])
        expect(1).to.equal(summary.categories[NEW_CONCURRENT_EMPLOYMENT])
        expect(14).to.equal(summary.categories[CHANGE_EMPLOYER])
        expect(82).to.equal(summary.categories[AMENDED_PETITION])

        expect(9).to.equal(summary[TOTAL_LCAS])
        expect(68).to.equal(summary[TOTAL_WORKERS])
        delete summary.wageLevels.workers[LEVEL_1]
        delete summary.wageLevels.workers[LEVEL_2]
        delete summary.wageLevels.workers[LEVEL_3]
        delete summary.wageLevels.workers[LEVEL_4]
        delete summary.wageLevels.workers[UNSPECIFIED]
        expect(_.isEmpty(summary.wageLevels.workers)).to.be.true
        delete summary.wageLevels.workers
        delete summary.wageLevels.lcas[LEVEL_1]
        delete summary.wageLevels.lcas[LEVEL_2]
        delete summary.wageLevels.lcas[LEVEL_3]
        delete summary.wageLevels.lcas[LEVEL_4]
        delete summary.wageLevels.lcas[UNSPECIFIED]
        expect(_.isEmpty(summary.wageLevels.lcas)).to.be.true
        delete summary.wageLevels.lcas
        expect(_.isEmpty(summary.wageLevels)).to.be.true
        delete summary.wageLevels
        delete summary.categories[NEW_EMPLOYMENT]
        delete summary.categories[CONTINUED_EMPLOYMENT]
        delete summary.categories[CHANGE_PREVIOUS_EMPLOYMENT]
        delete summary.categories[NEW_CONCURRENT_EMPLOYMENT]
        delete summary.categories[CHANGE_EMPLOYER]
        delete summary.categories[AMENDED_PETITION]
        expect(_.isEmpty(summary.categories)).to.be.true
        delete summary.categories
        delete summary[TOTAL_LCAS]
        delete summary[TOTAL_WORKERS]
        delete summary['wageArray']
        delete summary['percentiles']
        delete summary['occupations']
        expect(_.isEmpty(summary)).to.be.true
        logger.trace("summary: " + JSON.stringify(summary, undefined, 2))
    })
})

describe('Test findLevels', () => {
    logger.trace('testing findLevels');
    it('1) findLevels should find percentile levels of array of 100 Numbers', () => {
        var array = []
        for(var i = 0; i < 100; ++i){
            array.push(i)
        }
        const levels = findLevels(array)
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(10)
        expect(levels['25%']).to.equal(25)
        expect(levels['50%']).to.equal(50)
        expect(levels['75%']).to.equal(74)
        expect(levels['90%']).to.equal(89)
        expect(levels['100%']).to.equal(99)

    })
        
    it('2) findLevels should find percentile levels of array of 9 Numbers', () => {
        var array = []
        for(var i = 0; i < 9; ++i){
            array.push(i)
        }
        const levels = findLevels(array)
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(1)
        expect(levels['25%']).to.equal(2)
        expect(levels['50%']).to.equal(4)
        expect(levels['75%']).to.equal(6)
        expect(levels['90%']).to.equal(7)
        expect(levels['100%']).to.equal(8)
    })
        
    it('3) findLevels should find percentile levels of array of 11 Numbers', () => {
        var array = []
        for(var i = 0; i < 11; ++i){
            array.push(i)
        }
        const levels = findLevels(array)
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(1)
        expect(levels['25%']).to.equal(3)
        expect(levels['50%']).to.equal(5)
        expect(levels['75%']).to.equal(8)
        expect(levels['90%']).to.equal(9)
        expect(levels['100%']).to.equal(10)
    })
        
})

describe('Test countItems', () => {
    logger.trace('testing countItems');
    it('1) test countItems with 99 Numbers', () => {
        var array = []
        for(var i = 0; i < 99; ++i){
            array.push(5)
        }
        var count = countItems(array, 5)
        expect(count).to.equal(99)
    })
    it('2) test countItems with 0 Numbers', () => {
        var array = []
        for(var i = 0; i < 99; ++i){
            array.push(5)
        }
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
    it('3) test countItems with empty array', () => {
        var array = []
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
    it('4) test countItems with undefined array', () => {
        var array = undefined
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
})
