const log4js = require('log4js')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const request = require('supertest')
const log = console.log;
const logger = log4js.getLogger('h1bData');
const chalk = require('chalk')
const { asyncForEach, asyncForLoop } = require('../src/utilities/asyncRoutines')
const { summarize, decompressSummaryRecord, readSummarizedQueries,
        createKey } = require('../src/utilities/summarize')
var { summaryMap } = require('../src/utilities/summarize')
    
const { h1bRecordRouter, performQuery, processWsState, createCaseNumberQueryArray } 
            = require('../src/routers/h1bRecordRouter')
const { app } = require('../src/app')
const expect = require('chai').expect
const sinon = require('sinon')

const _ = require('lodash')
const { compress, decompress } = require('../src/utilities/compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, EMPLOYER_ADDRESS,
    EMPLOYER_CITY, EMPLOYER_STATE, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    JOB_TITLE, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

class JsonTest {
    constructor(res, stat, query){
        this.res = res
        this.stat = stat
        this.query = query
        var queryCopy = _.clone(query)
        delete queryCopy['YEAR']
        if(_.isEmpty(queryCopy)){
            this.yearRequest = true
        }else{
            this.yearRequest = false
        }
    }
    status(val) {
        expect(val).to.be.equal(this.stat)
        return this.res
    }

    json(h1bSummary) {
        const keys = Object.getOwnPropertyNames(this.query)
        const h1bSummaryKeys = Object.getOwnPropertyNames(h1bSummary)
        logger.trace(chalk.bgRed.white.bold(`query keys result: ${JSON.stringify(keys)}`))
        logger.trace(chalk.bgRed.white.bold(`h1bSummaryKeys result: ${JSON.stringify(h1bSummaryKeys)}`))
        keys.forEach((key) => {
            expect(this.query[key]).to.be.equal(h1bSummary[key])
            delete h1bSummary[key]
        })
        expect(!_.isEmpty(h1bSummary)).to.be.true
        expect(_.isNumber(h1bSummary[TOTAL_LCAS])).to.be.true
        expect(_.isNumber(h1bSummary[TOTAL_WORKERS])).to.be.true
        expect(!_.isEmpty(h1bSummary.status)).to.be.true
        expect(_.isEmpty(h1bSummary.occupations)).to.be.true
        expect(_.isEmpty(h1bSummary.categories)).to.be.true
        expect(_.isEmpty(h1bSummary.latLngMap)).to.be.true
        expect(_.isEmpty(h1bSummary.percentiles)).to.be.true
        expect(_.isEmpty(h1bSummary.wageMap)).to.be.true
        expect(_.isEmpty(h1bSummary.wageLevels)).to.be.true
        expect(_.isEmpty(h1bSummary.lcas)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`Unit test result: ${JSON.stringify(h1bSummary)}`))

        const decompressed = decompress(h1bSummary.status)
        expect(_.isEmpty(decompressed.status)).to.be.true
        expect(_.isEmpty(decompressed.occupations)).to.be.false
        expect(_.isEmpty(decompressed.categories)).to.be.false
        if(!this.yearRequest){
            expect(_.isEmpty(decompressed.latLngMap)).to.be.false
            expect(_.isEmpty(decompressed.percentiles)).to.be.false
            expect(_.isEmpty(decompressed.wageMap)).to.be.false
        }
        expect(_.isEmpty(decompressed.wageLevels)).to.be.false
        expect(_.isEmpty(decompressed.wageLevels.workers)).to.be.false
        expect(_.isEmpty(decompressed.wageLevels.lcas)).to.be.false

        delete decompressed.occupations
        delete decompressed.categories
        delete decompressed.latLngMap
        delete decompressed.percentiles
        delete decompressed.wageMap
        delete decompressed.wageLevels.workers
        delete decompressed.wageLevels.lcas
        expect(_.isEmpty(decompressed.wageLevels)).to.be.true
        delete decompressed.wageLevels
        expect(_.isEmpty(decompressed)).to.be.true

        delete h1bSummary[TOTAL_LCAS]
        delete h1bSummary[TOTAL_WORKERS]
        delete h1bSummary.status
        logger.trace(chalk.bgRed.white.bold(`h1bSummary: ${JSON.stringify(h1bSummary, undefined, 2)}`))
        expect(_.isEmpty(h1bSummary)).to.be.true
    }
}

describe('Test h1bRecordRouter', () => {
    describe('Test performQuery() handling a single year parameter', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })    
        logger.trace('Testing h1bRecordRouter');
        it('1) Testing performQuery() (year-2017) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('2) Testing performQuery() (year-2016) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('3) Testing performQuery() (year-2015) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2015
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('4) Testing performQuery() (year-2014) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2014
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('5) Testing performQuery() (year-2013) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2013
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('6) Testing performQuery() (year-2012) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2012
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('7) Testing performQuery() (year-2011) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2011
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
        it('8) Testing performQuery() (year-2010) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2010
            var query = {}
            query[YEAR] = year
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)   
        })
    })
    describe('Test performQuery()', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })    
        it('1) Testing performQuery() (year, state) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "WY"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('2) Testing performQuery() (year, state) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "WV"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('3) Testing performQuery() (year, state) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "AK"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('4) Testing performQuery() (year, employer) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const empName = "PRICEWATERHOUSECOOPERS LLP"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('5) Testing performQuery() (year, employer) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const empName = "ADOBE SYSTEMS INCORPORATED"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('6) Testing performQuery() (year, employer) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const empName = "MCKINSEY & COMPANY, INC. UNITED STATES"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('7) Testing performQuery() (year, state, city) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "TX"
            const wsCity = "PLANO"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CITY] = wsCity
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('8) Testing performQuery() (year, state, city) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "NC"
            const wsCity = "GREENSBORO"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CITY] = wsCity
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('9) Testing performQuery() (year, state, city) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "NC"
            const wsCity = "GREENSBORO"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CITY] = wsCity
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('10) Testing performQuery() (year, state, county) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "MD"
            const wsCounty = "ANNE ARUNDEL"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('11) Testing performQuery() (year, state, county) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCounty = "PALM BEACH"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('12) Testing performQuery() (year, state, county) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "NC"
            const wsCounty = "DURHAM"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('13) Testing performQuery() (year, state, city) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "NC"
            const wsCity = "DURHAM"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CITY] = wsCity
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('14) Testing performQuery() (year, state, congress district) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "VA"
            const wsCongressDist = 2
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('15) Testing performQuery() (year, state, congress district) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "NY"
            const wsCongressDist = 10
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('16) Testing performQuery() (year, state, congress district) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "NC"
            const wsCongressDist = 4
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('17) Testing performQuery() (year, state, county) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "CA"
            const wsCounty = 'ALAMEDA'
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('18) Testing performQuery() (year, state, county) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2014
            const wsState = "PA"
            const wsCounty = 'PHILADELPHIA'
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
        it('19) Testing performQuery() (year, state, county) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "NC"
            const wsCounty = 'MECKLENBURG'
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_COUNTY] = wsCounty
            const req = { "body": query }
            const res = {}
            var jsonTest = new JsonTest(res, 200, query)
            res.status = (val) => jsonTest.status(val)
            res.json = (h1bRecord) => jsonTest.json(h1bRecord)
            await performQuery(req, res)
        })
    })
    describe('Test \'/h1bWsState\'', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing \'/h1bWsState\' without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "ID"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsState').send(query).expect(200)
        })
        it('2) Testing \'/h1bWsState\' with no state', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            var query = {}
            query[YEAR] = year
            await request(app).get('/h1bWsState').send(query).expect(500)
        })
        it('3) Testing \'/h1bWsState\' with empty state', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = ""
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsState').send(query).expect(500)
        })
        it('4) Testing \'/h1bWsState\' with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "WY"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsState').send(query).expect(200)
        })
        it('5) Testing \'/h1bWsState\' with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "AK"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsState').send(query).expect(200)
        })
        it('6) Testing \'/h1bWsState\' with invalid year', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2009
            const wsState = "WY"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsState').send(query).expect(500)
        })
    })
    describe('Test \'/h1bWsCd\'', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing \'/h1bWsCd\' without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCongressDist = 21
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsState').send(query).expect(200)
        })
        it('2) Testing \'/h1bWsCd\' with no state', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsCongressDist = 21
            var query = {}
            query[YEAR] = year
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('3) Testing \'/h1bWsCd\' with no congressional district', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "GA"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('4) Testing \'/h1bWsCd\' with empty state', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = ""
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('5) Testing \'/h1bWsCd\' with congress district as char string', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCongressDist = "2"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('6) Testing \'/h1bWsCd\' with congress district as object', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCongressDist = {"id":"2"}
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('7) Testing \'/h1bWsCd\' with congress district as array', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCongressDist = [2]
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
        it('8) Testing \'/h1bWsCd\' with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "FL"
            const wsCongressDist = 2
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(200)
        })
        it('9) Testing \'/h1bWsCd\' with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "AK"
            const wsCongressDist = 1
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(200)
        })
        it('10) Testing \'/h1bWsCd\' with invalid year', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2009
            const wsState = "WY"
            const wsCongressDist = 1
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            query[WORKSITE_CONGRESS_DISTRICT] = wsCongressDist
            await request(app).get('/h1bWsCd').send(query).expect(500)
        })
    })
    describe('Test \'/h1bSummary\'', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing \'/h1bSummary\' (year, state) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "ID"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(1215).to.be.equal(respObj[TOTAL_WORKERS])
            expect(765).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('2) Testing \'/h1bSummary\' (year, state) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const wsState = "WY"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(170).to.be.equal(respObj[TOTAL_WORKERS])
            expect(113).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('3) Testing \'/h1bSummary\' (year, state) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "AK"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(329).to.be.equal(respObj[TOTAL_WORKERS])
            expect(154).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('4) Testing \'/h1bSummary\' (year, state) with invalid year', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2007
            const wsState = "WY"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            const response = await request(app).get('/h1bSummary').send(query).expect(500)
            expect(h1bRecordRouter.INVALID_YEAR).to.be.equal(response.text)
            logger.trace(chalk.bgRed.white.bold(`response: ${JSON.stringify(response)}`))
        })
        it('5) Testing \'/h1bSummary\' (year, employerName) without key in summaryMap', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const empName = "DELOITTE CONSULTING LLP"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(122189).to.be.equal(respObj[TOTAL_WORKERS])
            expect(7500).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('6) Testing \'/h1bSummary\' (year, employerName) with undefined summaryMap', async () => {
            summaryMap = undefined
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2017
            const empName = "COGNIZANT TECHNOLOGY SOLUTIONS U.S. CORPORATION"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(50755).to.be.equal(respObj[TOTAL_WORKERS])
            expect(2364).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('7) Testing \'/h1bSummary\' (year, employerName) with key in summaryMap', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const empName = "ORACLE AMERICA, INC."
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(7307).to.be.equal(respObj[TOTAL_WORKERS])
            expect(799).to.be.equal(respObj[TOTAL_LCAS])
        })
        it('8) Testing \'/h1bSummary\' (year, employerName) with invalid year', async () => {
            expect(_.isEmpty(summaryMap)).to.be.false
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2007
            const empName = "ERNST & YOUNG U.S. LLP"
            var query = {}
            query[YEAR] = year
            query[EMPLOYER_NAME] = empName
            const response = await request(app).get('/h1bSummary').send(query).expect(500)
            logger.trace(chalk.bgRed.white.bold(`response: ${JSON.stringify(response.text)}`))
            expect(h1bRecordRouter.INVALID_YEAR).to.be.equal(response.text)
        })
        it('9) Testing \'/h1bSummary\' (year, caseNumbers) with valid year', async () => {
           const year = 2017
            const caseNumbers = ["I-200-16293-304765", "I-200-16287-943040", "I-200-16305-330106"]
            var query = {}
            query[YEAR] = year
            query[CASE_NUMBER] = caseNumbers
            const response = await request(app).get('/h1bSummary').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            expect(8).to.be.equal(respObj[TOTAL_WORKERS])
            expect(3).to.be.equal(respObj[TOTAL_LCAS])
        })
    })
    describe('Test \'/h1bCount\'', () => {
        beforeEach(async() => {
            summaryMap = await readSummarizedQueries()
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing \'/h1bCount\' (year, state)', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsState = "ID"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bCount').send(query).expect(200)
        })
        it('2) Testing \'/h1bCount\' (year, county)', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2016
            const wsCounty = "WAKE"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_COUNTY] = wsCounty
            await request(app).get('/h1bCount').send(query).expect(200)
        })
        it('3) Testing \'/h1bCount\' (year, state); invalid year', async () => {
            summaryMap = {}
            expect(_.isEmpty(summaryMap)).to.be.true
            logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
            const year = 2006
            const wsState = "ID"
            var query = {}
            query[YEAR] = year
            query[WORKSITE_STATE] = wsState
            await request(app).get('/h1bCount').send(query).expect(500)
        })
    })
    describe('Test createCaseNumberQueryArray()', () => {
        // It appears that I do not need this routine. I am leaving it because I may need
        // it at a later date.
        const goodStringArray = ['String 1', 'String 2', 'String 3']
        const goodStringArrayTranslated = { $or: [{ CASE_NUMBER: goodStringArray[0]},
                                                { CASE_NUMBER: goodStringArray[1]},
                                                { CASE_NUMBER: goodStringArray[2]}
                                                ]}
        const badStringArray = ['String 1', 55]
        beforeEach(async() => {
            logger.trace(`summaryMap: ${JSON.stringify(summaryMap, undefined, 2)}`)
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing createCaseNumberQueryArray with good array of strings', () => {
            logger.trace(chalk.bgRed.white.bold
                (`good: ${JSON.stringify(createCaseNumberQueryArray(goodStringArray), undefined, 2)}`))
            logger.trace(chalk.bgRed.white.bold
                (`expected: ${JSON.stringify(goodStringArrayTranslated, undefined, 2)}`))
            expect(goodStringArrayTranslated).to.deep.equal(createCaseNumberQueryArray(goodStringArray))
        })
        it('2) Testing createCaseNumberQueryArray with a good single string', () => {
            const singleString = "singleString"
            expect(singleString).to.equal(createCaseNumberQueryArray(singleString))
        })
        it('3) Testing createCaseNumberQueryArray with bad array of strings', () => {
            try{
                const badValue = createCaseNumberQueryArray(badStringArray)
                expect(false).to.be.true
            }catch(e){
                logger.trace(chalk.bgRed.white.bold(`e: ${JSON.stringify(e, undefined, 2)}`))
                expect(e).to.be.equal(`${h1bRecordRouter.INVALID_CASE_NUMBER}55`)
            }
        })    
        it('4) Testing createCaseNumberQueryArray with a number', () => {
            try{
                const badValue = createCaseNumberQueryArray(55)
                expect(false).to.be.true
            }catch(e){
                logger.trace(chalk.bgRed.white.bold(`e: ${JSON.stringify(e, undefined, 2)}`))
                expect(e).to.be.equal(`${h1bRecordRouter.INVALID_CASE_NUMBER}55`)
            }
        })    
        it('5) Testing createCaseNumberQueryArray with an object', () => {
            try{
                const badValue = createCaseNumberQueryArray({})
                expect(false).to.be.true
            }catch(e){
                logger.trace(chalk.bgRed.white.bold(`e: ${JSON.stringify(e, undefined, 2)}`))
                expect(e).to.be.equal(`${h1bRecordRouter.INVALID_CASE_NUMBER}\{\}`)
            }
        })    
    })
    describe('Test \'/h1bCaseNumber\'', () => {
        beforeEach(async() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'warn' } }
            });
        })
        afterEach(() => {
            log4js.configure({
                // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
                appenders: { h1bData: { type: 'console'} },
                categories: { default: { appenders: ['h1bData'], level: 'info' } }
            });
            sinon.restore()
        })
        it('1) Testing \'/h1bCaseNumber\' with single Case Number', async() => {
            const year = 2017
            var query = {}
            query[YEAR] = year
            query[CASE_NUMBER] = "I-200-16274-852162"
            const response = await request(app).get('/h1bCaseNumber').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            logger.trace(`respObj: ${JSON.stringify(respObj, undefined, 2)}`)
            expect(!_.isEmpty(respObj)).to.be.true
            expect(_.isArray(respObj)).to.be.true
            expect(1).to.be.equal(respObj.length)
            const lca = respObj[0]
            expect('HOME DEPOT USA, INC.').to.be.equal(lca[EMPLOYER_NAME])
        })
        it('2) Testing \'/h1bCaseNumber\' with an array of one Case Number', async() => {
            const year = 2017
            var query = {}
            query[YEAR] = year
            query[CASE_NUMBER] = ["I-200-16307-654309"]
            const response = await request(app).get('/h1bCaseNumber').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            logger.trace(`respObj: ${JSON.stringify(respObj, undefined, 2)}`)
            expect(!_.isEmpty(respObj)).to.be.true
            expect(_.isArray(respObj)).to.be.true
            expect(1).to.be.equal(respObj.length)
            const lca = respObj[0]
            expect('PROGRAMMER ANALYST').to.be.equal(lca[JOB_TITLE])
            expect('SYNTEL INC').to.be.equal(lca[EMPLOYER_NAME])
        })
        it('3) Testing \'/h1bCaseNumber\' with an array of three Case Numbers', async() => {
            const year = 2017
            var query = {}
            query[YEAR] = year
            query[CASE_NUMBER] = ["I-200-16293-304765", "I-200-16287-943040", "I-200-16305-330106"]
            const response = await request(app).get('/h1bCaseNumber').send(query).expect(200)
            const respObj = JSON.parse(response.text)
            logger.trace(`respObj: ${JSON.stringify(respObj, undefined, 2)}`)
            expect(!_.isEmpty(respObj)).to.be.true
            expect(_.isArray(respObj)).to.be.true
            expect(3).to.be.equal(respObj.length)
            var lcas = respObj.sort((a, b) => (a[CASE_NUMBER] > b[CASE_NUMBER]) ? 1 : -1)
            logger.trace(`lcas: ${JSON.stringify(lcas, undefined, 2)}`)
            expect("I-200-16287-943040").to.be.equal(lcas[0][CASE_NUMBER])
            expect("I-200-16293-304765").to.be.equal(lcas[1][CASE_NUMBER])
            expect("I-200-16305-330106").to.be.equal(lcas[2][CASE_NUMBER])
            var lca = respObj[0]
            expect('ARCHITECT').to.be.equal(lca[JOB_TITLE])
            expect(1).to.be.equal(lca[TOTAL_WORKERS])
            expect(LEVEL_2).to.be.equal(lca[WAGE_LEVEL])
            var lca = respObj[1]
            expect('SENIOR SOFTWARE DEVELOPER').to.be.equal(lca[JOB_TITLE])
            expect(6).to.be.equal(lca[TOTAL_WORKERS])
            expect(LEVEL_3).to.be.equal(lca[WAGE_LEVEL])
            var lca = respObj[2]
            expect('ANALYST').to.be.equal(lca[JOB_TITLE])
            expect('TATA CONSULTANCY SERVICES LIMITED').to.be.equal(lca[EMPLOYER_NAME])
            expect(1).to.be.equal(lca[TOTAL_WORKERS])
            expect(LEVEL_2).to.be.equal(lca[WAGE_LEVEL])
        })
        it('4) Testing \'/h1bCaseNumber\' with invalid year', async() => {
            const year = 2001
            var query = {}
            query[YEAR] = year
            query[CASE_NUMBER] = ["I-200-16307-654309"]
            const response = await request(app).get('/h1bCaseNumber').send(query).expect(500)
        })
    })
})   

