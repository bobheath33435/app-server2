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

const { initYearObject, mergeStateObjects, finalizeMerge } 
        = require('../src/buildSummaries')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE,
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_WAGE_RATE_OF_PAY, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

describe('Test initYearObject', () => {
    logger.trace('testing createKey');
    it('1) initYearObject should initialize Year Object', () => {
        const yearObject = initYearObject(2017)
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
})

