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
const { summarize, createKey, calculatePercentiles, countItems, buildWageArray,
    compressSummaryRecord, decompressSummaryRecord
} 
        = require('../src/utilities/summarize')

const { initYearObject, mergeStateObjects, finalizeMerge } 
        = require('../src/buildSummaries')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, H1B_DEPENDENT,
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_WAGE_RATE_OF_PAY, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

    var yearObject = initYearObject(2017)
    var summary = {}
    var h1bRecords1 = [
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, CONTINUED_EMPLOYMENT: 14,
            ANNUALIZED_WAGE_RATE_OF_PAY: 1, SOC_CODE: "123", CASE_NUMBER: "rrrr", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 2, SOC_CODE: "123", CASE_NUMBER: "ssss", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, NEW_CONCURRENT_EMPLOYMENT: 3,
            ANNUALIZED_WAGE_RATE_OF_PAY: 3, SOC_CODE: "123", CASE_NUMBER: "tttt", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, CHANGE_EMPLOYER: 100,
            ANNUALIZED_WAGE_RATE_OF_PAY: 4, SOC_CODE: "123", CASE_NUMBER: "uuuu", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 5, SOC_CODE: "123", CASE_NUMBER: "vvvvv", H1B_DEPENDENT: "N",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 6, SOC_CODE: "123", CASE_NUMBER: "wwww", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, AMENDED_PETITION: 8,
            ANNUALIZED_WAGE_RATE_OF_PAY: 7, SOC_CODE: "123", CASE_NUMBER: "xxxx", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 8, SOC_CODE: "123", CASE_NUMBER: "yyyy", H1B_DEPENDENT: "N",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},  
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 9, SOC_CODE: "123", CASE_NUMBER: "zzzz", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8}           
    ]
    var h1bRecords2 = [
        {WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 4, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, CONTINUED_EMPLOYMENT: 14,
            ANNUALIZED_WAGE_RATE_OF_PAY: 1, SOC_CODE: "123", CASE_NUMBER: "aaaa", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_ADDR1: "addr1", WORKSITE_ADDR2: "addr2", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 2, SOC_CODE: "123", CASE_NUMBER: "bbbb", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, NEW_CONCURRENT_EMPLOYMENT: 3,
            ANNUALIZED_WAGE_RATE_OF_PAY: 3, SOC_CODE: "123", CASE_NUMBER: "cccc", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_ADDR2: "addr2", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, CHANGE_EMPLOYER: 100,
            ANNUALIZED_WAGE_RATE_OF_PAY: 4, SOC_CODE: "123", CASE_NUMBER: "dddd", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 6, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 5, SOC_CODE: "123", CASE_NUMBER: "eeee", H1B_DEPENDENT: "N",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 6, SOC_CODE: "123", CASE_NUMBER: "ffff", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1, AMENDED_PETITION: 8,
            ANNUALIZED_WAGE_RATE_OF_PAY: 7, SOC_CODE: "123", CASE_NUMBER: "gggg", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 8, SOC_CODE: "123", CASE_NUMBER: "hhhh", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},  
        {TOTAL_WORKERS: 1, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 9, SOC_CODE: "123", CASE_NUMBER: "iiii", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8}           
    ]
    var query = { "YEAR": 2017 }
    describe('Test initYearObject, mergeStateObjects, finalizeMerge', () => {
        beforeEach(() => {
            yearObject = initYearObject(2017)
            summary = summarize(h1bRecords1, query)
        })
        
        logger.trace('Test initYearObject');
        it('1) initYearObject should initialize Year Object', () => {
            expect(2017).to.equal(yearObject.YEAR)
            expect(0).to.equal(yearObject.TOTAL_LCAS)
            expect(0).to.equal(yearObject.TOTAL_WORKERS)
            expect(0).to.equal(yearObject.categories[NEW_EMPLOYMENT])
            expect(0).to.equal(yearObject.categories[CONTINUED_EMPLOYMENT])
            expect(0).to.equal(yearObject.categories[CHANGE_PREVIOUS_EMPLOYMENT])
            expect(0).to.equal(yearObject.categories[NEW_CONCURRENT_EMPLOYMENT])
            expect(0).to.equal(yearObject.categories[CHANGE_EMPLOYER])
            expect(0).to.equal(yearObject.categories[AMENDED_PETITION])
            expect(0).to.equal(yearObject.wageLevels.lcas[LEVEL_1])
            expect(0).to.equal(yearObject.wageLevels.lcas[LEVEL_2])
            expect(0).to.equal(yearObject.wageLevels.lcas[LEVEL_3])
            expect(0).to.equal(yearObject.wageLevels.lcas[LEVEL_4])
            expect(0).to.equal(yearObject.wageLevels.lcas[UNSPECIFIED])
            expect(0).to.equal(yearObject.wageLevels.workers[LEVEL_1])
            expect(0).to.equal(yearObject.wageLevels.workers[LEVEL_2])
            expect(0).to.equal(yearObject.wageLevels.workers[LEVEL_3])
            expect(0).to.equal(yearObject.wageLevels.workers[LEVEL_4])
            expect(0).to.equal(yearObject.wageLevels.workers[UNSPECIFIED])
            expect({}).to.deep.equal(yearObject.occupations)
    
            delete yearObject.YEAR
            delete yearObject.TOTAL_LCAS
            delete yearObject.TOTAL_WORKERS
            delete yearObject.categories[NEW_EMPLOYMENT]
            delete yearObject.categories[CONTINUED_EMPLOYMENT]
            delete yearObject.categories[CHANGE_PREVIOUS_EMPLOYMENT]
            delete yearObject.categories[NEW_CONCURRENT_EMPLOYMENT]
            delete yearObject.categories[CHANGE_EMPLOYER]
            delete yearObject.categories[AMENDED_PETITION]
            expect({}).to.deep.equal(yearObject.categories)
            delete yearObject.wageLevels.lcas[LEVEL_1]
            delete yearObject.wageLevels.lcas[LEVEL_2]
            delete yearObject.wageLevels.lcas[LEVEL_3]
            delete yearObject.wageLevels.lcas[LEVEL_4]
            delete yearObject.wageLevels.lcas[UNSPECIFIED]
            expect({}).to.deep.equal(yearObject.wageLevels.lcas)
            delete yearObject.wageLevels.workers[LEVEL_1]
            delete yearObject.wageLevels.workers[LEVEL_2]
            delete yearObject.wageLevels.workers[LEVEL_3]
            delete yearObject.wageLevels.workers[LEVEL_4]
            delete yearObject.wageLevels.workers[UNSPECIFIED]
            expect({}).to.deep.equal(yearObject.wageLevels.workers)
            delete yearObject.categories
            delete yearObject.wageLevels.lcas
            delete yearObject.wageLevels.workers
            expect({}).to.deep.equal(yearObject.wageLevels)
            delete yearObject.wageLevels
            delete yearObject.occupations
            expect({}).to.deep.equal(yearObject)
        })
        it('2) test mergeStateObjects', () => {
            logger.trace(`summary - ${JSON.stringify(summary, undefined, 2)}`)
            yearObject = initYearObject(2017)
            logger.trace(`yearObject init - ${JSON.stringify(yearObject, undefined, 2)}`)
            yearObject = mergeStateObjects(yearObject, summary)
            logger.trace(`yearObject after merge - ${JSON.stringify(yearObject, undefined, 2)}`)
            expect(2017).to.equal(yearObject.YEAR)
            expect(9).to.equal(yearObject.TOTAL_LCAS)
            expect(9).to.equal(yearObject.TOTAL_WORKERS)
            delete yearObject.YEAR
            delete yearObject.TOTAL_LCAS
            delete yearObject.TOTAL_WORKERS
            const categories = yearObject.categories
            expect(45).to.equal(categories.NEW_EMPLOYMENT)
            expect(14).to.equal(categories.CONTINUED_EMPLOYMENT)
            expect(9).to.equal(categories.CHANGE_PREVIOUS_EMPLOYMENT)
            expect(3).to.equal(categories.NEW_CONCURRENT_EMPLOYMENT)
            expect(100).to.equal(categories.CHANGE_EMPLOYER)
            expect(8).to.equal(categories.AMENDED_PETITION)
            delete categories.NEW_EMPLOYMENT
            delete categories.CONTINUED_EMPLOYMENT
            delete categories.CHANGE_PREVIOUS_EMPLOYMENT
            delete categories.NEW_CONCURRENT_EMPLOYMENT
            delete categories.CHANGE_EMPLOYER
            delete categories.AMENDED_PETITION
            expect(_.isEmpty(categories)).to.be.true
            delete yearObject.categories
            
            const lcas = yearObject.wageLevels.lcas
            expect(3).to.equal(lcas[LEVEL_1])
            expect(1).to.equal(lcas[LEVEL_2])
            expect(0).to.equal(lcas[LEVEL_3])
            expect(2).to.equal(lcas[LEVEL_4])
            expect(3).to.equal(lcas[UNSPECIFIED])
            delete lcas[LEVEL_1]
            delete lcas[LEVEL_2]
            delete lcas[LEVEL_3]
            delete lcas[LEVEL_4]
            delete lcas[UNSPECIFIED]
            expect(_.isEmpty(lcas)).to.be.true
            
            const workers = yearObject.wageLevels.workers
            expect(3).to.equal(workers[LEVEL_1])
            expect(1).to.equal(workers[LEVEL_2])
            expect(0).to.equal(workers[LEVEL_3])
            expect(2).to.equal(workers[LEVEL_4])
            expect(3).to.equal(workers[UNSPECIFIED])
            delete workers[LEVEL_1]
            delete workers[LEVEL_2]
            delete workers[LEVEL_3]
            delete workers[LEVEL_4]
            delete workers[UNSPECIFIED]
            expect(_.isEmpty(workers)).to.be.true
            delete yearObject.wageLevels.lcas
            delete yearObject.wageLevels.workers
            expect(_.isEmpty(yearObject.wageLevels)).to.be.true
            delete yearObject.wageLevels
    
            var occupations = yearObject.occupations
            const props = Object.getOwnPropertyNames(occupations)
            expect(1).to.equal(props.length)
            expect("123").to.equal(props[0])
            const occupation = occupations["123"]
            const data = occupation.data
            expect("123").to.equal(data["SOC_CODE"])
            expect({}).to.deep.equal(data.percentiles)
            delete data["SOC_CODE"]
            delete data.percentiles
    
            const wageMap = data.wageMap
            expect(1).to.equal(wageMap["1"])
            expect(1).to.equal(wageMap["2"])
            expect(1).to.equal(wageMap["3"])
            expect(1).to.equal(wageMap["4"])
            expect(1).to.equal(wageMap["5"])
            expect(1).to.equal(wageMap["6"])
            expect(1).to.equal(wageMap["7"])
            expect(1).to.equal(wageMap["8"])
            expect(1).to.equal(wageMap["9"])
            delete wageMap["1"]
            delete wageMap["2"]
            delete wageMap["3"]
            delete wageMap["4"]
            delete wageMap["5"]
            delete wageMap["6"]
            delete wageMap["7"]
            delete wageMap["8"]
            delete wageMap["9"]
            expect(_.isEmpty(wageMap)).to.be.true
            delete data.wageMap
            expect(_.isEmpty(data)).to.be.true
            delete occupation.data
            expect(_.isEmpty(occupation)).to.be.true
            delete occupations["123"]
            expect(_.isEmpty(occupations)).to.be.true
            delete yearObject.occupations
            expect(_.isEmpty(yearObject)).to.be.true
     
            logger.trace(`yearObject merge - ${JSON.stringify(yearObject, undefined, 2)}`)
        })
        it('3) test finalizeMerge', () => {
            logger.trace(`summary - ${JSON.stringify(summary, undefined, 2)}`)
            yearObject = initYearObject(2017)
            logger.trace(`yearObject init - ${JSON.stringify(yearObject, undefined, 2)}`)
            yearObject = mergeStateObjects(yearObject, summary)
            yearObject = finalizeMerge(yearObject)
            expect(2017).to.equal(yearObject.YEAR)
            expect(9).to.equal(yearObject.TOTAL_LCAS)
            expect(9).to.equal(yearObject.TOTAL_WORKERS)
            delete yearObject.YEAR
            delete yearObject.TOTAL_LCAS
            delete yearObject.TOTAL_WORKERS
            const categories = yearObject.categories
            expect(45).to.equal(categories.NEW_EMPLOYMENT)
            expect(14).to.equal(categories.CONTINUED_EMPLOYMENT)
            expect(9).to.equal(categories.CHANGE_PREVIOUS_EMPLOYMENT)
            expect(3).to.equal(categories.NEW_CONCURRENT_EMPLOYMENT)
            expect(100).to.equal(categories.CHANGE_EMPLOYER)
            expect(8).to.equal(categories.AMENDED_PETITION)
            delete categories.NEW_EMPLOYMENT
            delete categories.CONTINUED_EMPLOYMENT
            delete categories.CHANGE_PREVIOUS_EMPLOYMENT
            delete categories.NEW_CONCURRENT_EMPLOYMENT
            delete categories.CHANGE_EMPLOYER
            delete categories.AMENDED_PETITION
            expect(_.isEmpty(categories)).to.be.true
            delete yearObject.categories
            
            const lcas = yearObject.wageLevels.lcas
            expect(3).to.equal(lcas[LEVEL_1])
            expect(1).to.equal(lcas[LEVEL_2])
            expect(0).to.equal(lcas[LEVEL_3])
            expect(2).to.equal(lcas[LEVEL_4])
            expect(3).to.equal(lcas[UNSPECIFIED])
            delete lcas[LEVEL_1]
            delete lcas[LEVEL_2]
            delete lcas[LEVEL_3]
            delete lcas[LEVEL_4]
            delete lcas[UNSPECIFIED]
            expect(_.isEmpty(lcas)).to.be.true
            
            const workers = yearObject.wageLevels.workers
            expect(3).to.equal(workers[LEVEL_1])
            expect(1).to.equal(workers[LEVEL_2])
            expect(0).to.equal(workers[LEVEL_3])
            expect(2).to.equal(workers[LEVEL_4])
            expect(3).to.equal(workers[UNSPECIFIED])
            delete workers[LEVEL_1]
            delete workers[LEVEL_2]
            delete workers[LEVEL_3]
            delete workers[LEVEL_4]
            delete workers[UNSPECIFIED]
            expect(_.isEmpty(workers)).to.be.true
            delete yearObject.wageLevels.lcas
            delete yearObject.wageLevels.workers
            expect(_.isEmpty(yearObject.wageLevels)).to.be.true
            delete yearObject.wageLevels
    
            var occupations = yearObject.occupations
            const props = Object.getOwnPropertyNames(occupations)
            expect(1).to.equal(props.length)
            expect("123").to.equal(props[0])
            const occupation = occupations["123"]
            const data = occupation.data
            expect("123").to.equal(data["SOC_CODE"])
            const percentiles = data.percentiles
            expect(1).to.equal(percentiles["0%"])
            expect(2).to.equal(percentiles["10%"])
            expect(3).to.equal(percentiles["25%"])
            expect(5).to.equal(percentiles["50%"])
            expect(7).to.equal(percentiles["75%"])
            expect(8).to.equal(percentiles["90%"])
            expect(9).to.equal(percentiles["100%"])
            delete percentiles["0%"]
            delete percentiles["10%"]
            delete percentiles["25%"]
            delete percentiles["50%"]
            delete percentiles["75%"]
            delete percentiles["90%"]
            delete percentiles["100%"]
            expect({}).to.deep.equal(data.percentiles)
            expect(_.isEmpty(percentiles)).to.be.true
            delete data.percentiles
            
            delete data["SOC_CODE"]
    
            const wageMap = data.wageMap
            expect(1).to.equal(wageMap["1"])
            expect(1).to.equal(wageMap["2"])
            expect(1).to.equal(wageMap["3"])
            expect(1).to.equal(wageMap["4"])
            expect(1).to.equal(wageMap["5"])
            expect(1).to.equal(wageMap["6"])
            expect(1).to.equal(wageMap["7"])
            expect(1).to.equal(wageMap["8"])
            expect(1).to.equal(wageMap["9"])
            delete wageMap["1"]
            delete wageMap["2"]
            delete wageMap["3"]
            delete wageMap["4"]
            delete wageMap["5"]
            delete wageMap["6"]
            delete wageMap["7"]
            delete wageMap["8"]
            delete wageMap["9"]
            expect(_.isEmpty(wageMap)).to.be.true
            delete data.wageMap
            expect(_.isEmpty(data)).to.be.true
            delete occupation.data
            expect(_.isEmpty(occupation)).to.be.true
            delete occupations["123"]
            expect(_.isEmpty(occupations)).to.be.true
            delete yearObject.occupations
            expect(_.isEmpty(yearObject)).to.be.true
    
            logger.trace(`yearObject final - ${JSON.stringify(yearObject, undefined, 2)}`)
        })
    })
    
    describe('Test again initYearObject, mergeStateObjects, finalizeMerge', () => {
        beforeEach(() => {
            yearObject = initYearObject(2016)
            summary = summarize(h1bRecords2, query)
        })
        
        it('4) test mergeStateObjects', () => {
            logger.trace(`summary - ${JSON.stringify(summary, undefined, 2)}`)
            yearObject = initYearObject(2016)
            logger.trace(`yearObject init - ${JSON.stringify(yearObject, undefined, 2)}`)
            yearObject = mergeStateObjects(yearObject, summary)
            expect(2016).to.equal(yearObject.YEAR)
            expect(9).to.equal(yearObject.TOTAL_LCAS)
            expect(17).to.equal(yearObject.TOTAL_WORKERS)
            delete yearObject.YEAR
            delete yearObject.TOTAL_LCAS
            delete yearObject.TOTAL_WORKERS
            const categories = yearObject.categories
            expect(45).to.equal(categories.NEW_EMPLOYMENT)
            expect(14).to.equal(categories.CONTINUED_EMPLOYMENT)
            expect(9).to.equal(categories.CHANGE_PREVIOUS_EMPLOYMENT)
            expect(3).to.equal(categories.NEW_CONCURRENT_EMPLOYMENT)
            expect(100).to.equal(categories.CHANGE_EMPLOYER)
            expect(8).to.equal(categories.AMENDED_PETITION)
            delete categories.NEW_EMPLOYMENT
            delete categories.CONTINUED_EMPLOYMENT
            delete categories.CHANGE_PREVIOUS_EMPLOYMENT
            delete categories.NEW_CONCURRENT_EMPLOYMENT
            delete categories.CHANGE_EMPLOYER
            delete categories.AMENDED_PETITION
            expect(_.isEmpty(categories)).to.be.true
            delete yearObject.categories
            
            const lcas = yearObject.wageLevels.lcas
            expect(0).to.equal(lcas[LEVEL_1])
            expect(1).to.equal(lcas[LEVEL_2])
            expect(3).to.equal(lcas[LEVEL_3])
            expect(2).to.equal(lcas[LEVEL_4])
            expect(3).to.equal(lcas[UNSPECIFIED])
            delete lcas[LEVEL_1]
            delete lcas[LEVEL_2]
            delete lcas[LEVEL_3]
            delete lcas[LEVEL_4]
            delete lcas[UNSPECIFIED]
            expect(_.isEmpty(lcas)).to.be.true
            
            const workers = yearObject.wageLevels.workers
            expect(0).to.equal(workers[LEVEL_1])
            expect(1).to.equal(workers[LEVEL_2])
            expect(6).to.equal(workers[LEVEL_3])
            expect(7).to.equal(workers[LEVEL_4])
            expect(3).to.equal(workers[UNSPECIFIED])
            delete workers[LEVEL_1]
            delete workers[LEVEL_2]
            delete workers[LEVEL_3]
            delete workers[LEVEL_4]
            delete workers[UNSPECIFIED]
            expect(_.isEmpty(workers)).to.be.true
            delete yearObject.wageLevels.lcas
            delete yearObject.wageLevels.workers
            expect(_.isEmpty(yearObject.wageLevels)).to.be.true
            delete yearObject.wageLevels
    
            var occupations = yearObject.occupations
            const props = Object.getOwnPropertyNames(occupations)
            expect(1).to.equal(props.length)
            expect("123").to.equal(props[0])
            const occupation = occupations["123"]
            const data = occupation.data
            expect("123").to.equal(data["SOC_CODE"])
            expect({}).to.deep.equal(data.percentiles)
            delete data["SOC_CODE"]
            delete data.percentiles
    
            const wageMap = data.wageMap
            logger.trace(`wageMap - ${JSON.stringify(wageMap, undefined, 2)}`)
            expect(4).to.equal(wageMap["1"])
            expect(1).to.equal(wageMap["2"])
            expect(1).to.equal(wageMap["3"])
            expect(1).to.equal(wageMap["4"])
            expect(6).to.equal(wageMap["5"])
            expect(1).to.equal(wageMap["6"])
            expect(1).to.equal(wageMap["7"])
            expect(1).to.equal(wageMap["8"])
            expect(1).to.equal(wageMap["9"])
            delete wageMap["1"]
            delete wageMap["2"]
            delete wageMap["3"]
            delete wageMap["4"]
            delete wageMap["5"]
            delete wageMap["6"]
            delete wageMap["7"]
            delete wageMap["8"]
            delete wageMap["9"]
            expect(_.isEmpty(wageMap)).to.be.true
            delete data.wageMap
            expect(_.isEmpty(data)).to.be.true
            delete occupation.data
            expect(_.isEmpty(occupation)).to.be.true
            delete occupations["123"]
            expect(_.isEmpty(occupations)).to.be.true
            delete yearObject.occupations
            expect(_.isEmpty(yearObject)).to.be.true
     
            logger.trace(`yearObject merge - ${JSON.stringify(yearObject, undefined, 2)}`)
        })
        it('5) test finalizeMerge', () => {
            logger.trace(`summary - ${JSON.stringify(summary, undefined, 2)}`)
            yearObject = initYearObject(2016)
            logger.trace(`yearObject init - ${JSON.stringify(yearObject, undefined, 2)}`)
            yearObject = mergeStateObjects(yearObject, summary)
            yearObject = finalizeMerge(yearObject)
            logger.trace(`yearObject - ${JSON.stringify(yearObject, undefined, 2)}`)            
            expect(2016).to.equal(yearObject.YEAR)
            expect(9).to.equal(yearObject.TOTAL_LCAS)
            expect(17).to.equal(yearObject.TOTAL_WORKERS)
            delete yearObject.YEAR
            delete yearObject.TOTAL_LCAS
            delete yearObject.TOTAL_WORKERS
            const categories = yearObject.categories
            expect(45).to.equal(categories.NEW_EMPLOYMENT)
            expect(14).to.equal(categories.CONTINUED_EMPLOYMENT)
            expect(9).to.equal(categories.CHANGE_PREVIOUS_EMPLOYMENT)
            expect(3).to.equal(categories.NEW_CONCURRENT_EMPLOYMENT)
            expect(100).to.equal(categories.CHANGE_EMPLOYER)
            expect(8).to.equal(categories.AMENDED_PETITION)
            delete categories.NEW_EMPLOYMENT
            delete categories.CONTINUED_EMPLOYMENT
            delete categories.CHANGE_PREVIOUS_EMPLOYMENT
            delete categories.NEW_CONCURRENT_EMPLOYMENT
            delete categories.CHANGE_EMPLOYER
            delete categories.AMENDED_PETITION
            expect(_.isEmpty(categories)).to.be.true
            delete yearObject.categories
            
            const lcas = yearObject.wageLevels.lcas
            expect(0).to.equal(lcas[LEVEL_1])
            expect(1).to.equal(lcas[LEVEL_2])
            expect(3).to.equal(lcas[LEVEL_3])
            expect(2).to.equal(lcas[LEVEL_4])
            expect(3).to.equal(lcas[UNSPECIFIED])
            delete lcas[LEVEL_1]
            delete lcas[LEVEL_2]
            delete lcas[LEVEL_3]
            delete lcas[LEVEL_4]
            delete lcas[UNSPECIFIED]
            expect(_.isEmpty(lcas)).to.be.true
            
            const workers = yearObject.wageLevels.workers
            expect(0).to.equal(workers[LEVEL_1])
            expect(1).to.equal(workers[LEVEL_2])
            expect(6).to.equal(workers[LEVEL_3])
            expect(7).to.equal(workers[LEVEL_4])
            expect(3).to.equal(workers[UNSPECIFIED])
            delete workers[LEVEL_1]
            delete workers[LEVEL_2]
            delete workers[LEVEL_3]
            delete workers[LEVEL_4]
            delete workers[UNSPECIFIED]
            expect(_.isEmpty(workers)).to.be.true
            delete yearObject.wageLevels.lcas
            delete yearObject.wageLevels.workers
            expect(_.isEmpty(yearObject.wageLevels)).to.be.true
            delete yearObject.wageLevels
    
            var occupations = yearObject.occupations
            const props = Object.getOwnPropertyNames(occupations)
            expect(1).to.equal(props.length)
            expect("123").to.equal(props[0])
            const occupation = occupations["123"]
            const data = occupation.data
            expect("123").to.equal(data["SOC_CODE"])
            
            delete data["SOC_CODE"]
    
            const wageMap = data.wageMap
            logger.trace(`wageMap - ${JSON.stringify(wageMap, undefined, 2)}`)
            expect(4).to.equal(wageMap["1"])
            expect(1).to.equal(wageMap["2"])
            expect(1).to.equal(wageMap["3"])
            expect(1).to.equal(wageMap["4"])
            expect(6).to.equal(wageMap["5"])
            expect(1).to.equal(wageMap["6"])
            expect(1).to.equal(wageMap["7"])
            expect(1).to.equal(wageMap["8"])
            expect(1).to.equal(wageMap["9"])
            delete wageMap["1"]
            delete wageMap["2"]
            delete wageMap["3"]
            delete wageMap["4"]
            delete wageMap["5"]
            delete wageMap["6"]
            delete wageMap["7"]
            delete wageMap["8"]
            delete wageMap["9"]
            expect(_.isEmpty(wageMap)).to.be.true
            delete data.wageMap
            const percentiles = data.percentiles
            expect(1).to.equal(percentiles["0%"])
            expect(1).to.equal(percentiles["10%"])
            expect(2).to.equal(percentiles["25%"])
            expect(5).to.equal(percentiles["50%"])
            expect(5).to.equal(percentiles["75%"])
            expect(7).to.equal(percentiles["90%"])
            expect(9).to.equal(percentiles["100%"])
            delete percentiles["0%"]
            delete percentiles["10%"]
            delete percentiles["25%"]
            delete percentiles["50%"]
            delete percentiles["75%"]
            delete percentiles["90%"]
            delete percentiles["100%"]
            expect({}).to.deep.equal(data.percentiles)
            expect(_.isEmpty(percentiles)).to.be.true
            delete data.percentiles
            expect(_.isEmpty(data)).to.be.true
            delete occupation.data
            expect(_.isEmpty(occupation)).to.be.true
            delete occupations["123"]
            expect(_.isEmpty(occupations)).to.be.true
            delete yearObject.occupations
            expect(_.isEmpty(yearObject)).to.be.true
    
            logger.trace(`yearObject final - ${JSON.stringify(yearObject, undefined, 2)}`)
        })
    })
    
        