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
const sinon = require('sinon')
const modelMap = require('../src/models/dbRecords')
const { summarize, decompressSummaryRecord, readSummarizedQueries,
        createKey } = require('../src/utilities/summarize')
var { summaryMap } = require('../src/utilities/summarize')
    
const { performQuery, processWsState } = require('../src/routers/h1bRecordRouter')
const { app } = require('../src/app')

const expect = require('chai').expect
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
        expect(_.isEmpty(decompressed.latLngMap)).to.be.false
        expect(_.isEmpty(decompressed.percentiles)).to.be.false
        expect(_.isEmpty(decompressed.wageMap)).to.be.false
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
    it('1) Testing performQuery() (year, state) with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2017
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
        const year = 2011
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
        const year = 2015
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
    it('4) Testing performQuery() with (year, state, city) undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2014
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
    it('5) Testing performQuery() (year, state, city) without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
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
    it('6) Testing performQuery() (year, state, city) with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2012
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
    it('7) Testing performQuery() (year, state, county) with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
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
    it('8) Testing performQuery() (year, state, county) without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2010
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
    it('9) Testing performQuery() (year, state, county) with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2012
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
    it('10) Testing performQuery() (year, state, city) with key in summaryMap', async () => {
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
    it('11) Testing performQuery() (year, state, congress district) with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2012
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
    it('12) Testing performQuery() (year, state, congress district) without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
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
    it('13) Testing performQuery() (year, state, congress district) with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2014
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
    it('14) Testing \'/h1bWsState\' without key in summaryMap', async () => {
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
    it('15) Testing \'/h1bWsState\' with undefined summaryMap', async () => {
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
    it('16) Testing \'/h1bWsState\' with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2011
        const wsState = "AK"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bWsState').send(query).expect(200)
    })
    it('17) Testing \'/h1bWsState\' with invalid year', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2009
        const wsState = "WY"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bWsState').send(query).expect(500)
    })
    it('18) Testing \'/h1bSummary\' without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2016
        const wsState = "ID"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('19) Testing \'/h1bSummary\' with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2017
        const wsState = "WY"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('20) Testing \'/h1bSummary\' with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2010
        const wsState = "AK"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('21) Testing \'/h1bSummary\' with invalid year', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2007
        const wsState = "WY"
        var query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = wsState
        await request(app).get('/h1bSummary').send(query).expect(500)
    })
})   

