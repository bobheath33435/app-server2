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
        expect(_.isNumber(h1bSummary.TOTAL_LCAS)).to.be.true
        expect(_.isNumber(h1bSummary.TOTAL_WORKERS)).to.be.true
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

        delete h1bSummary.TOTAL_LCAS
        delete h1bSummary.TOTAL_WORKERS
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
    it('1) Testing performQuery() with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2017
        const wsState = "WY"
        const query = { YEAR: year, WORKSITE_STATE: wsState }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('2) Testing performQuery() without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2011
        const wsState = "WV"
        const query = { YEAR: year, WORKSITE_STATE: wsState }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('3) Testing performQuery() with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
        const wsState = "AK"
        const query = { YEAR: year, WORKSITE_STATE: wsState }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('4) Testing performQuery() with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2014
        const wsState = "TX"
        const wsCity = "PLANO"
        const query = { YEAR: year, WORKSITE_STATE: wsState , WORKSITE_CITY: wsCity }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('5) Testing performQuery() without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
        const wsState = "NC"
        const wsCity = "GREENSBORO"
        const query = { YEAR: year, WORKSITE_STATE: wsState, WORKSITE_CITY: wsCity }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('6) Testing performQuery() with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2012
        const wsState = "NC"
        const wsCity = "GREENSBORO"
        const query = { YEAR: year, WORKSITE_STATE: wsState, WORKSITE_CITY: wsCity }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('7) Testing performQuery() with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2015
        const wsState = "MD"
        const wsCounty = "ANNE ARUNDEL"
        const query = { YEAR: year, WORKSITE_STATE: wsState , WORKSITE_COUNTY: wsCounty }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('8) Testing performQuery() without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2010
        const wsState = "FL"
        const wsCounty = "PALM BEACH"
        const query = { YEAR: year, WORKSITE_STATE: wsState, WORKSITE_COUNTY: wsCounty }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('9) Testing performQuery() with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2016
        const wsState = "NC"
        const wsCity = "DURHAM"
        const query = { YEAR: year, WORKSITE_STATE: wsState, WORKSITE_CITY: wsCity }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('10) Testing performQuery() with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const year = 2012
        const wsState = "NC"
        const wsCounty = "DURHAM"
        const query = { YEAR: year, WORKSITE_STATE: wsState, WORKSITE_COUNTY: wsCounty }
        const req = { "body": query }
        const res = {}
        var jsonTest = new JsonTest(res, 200, query)
        res.status = (val) => jsonTest.status(val)
        res.json = (h1bRecord) => jsonTest.json(h1bRecord)
        await performQuery(req, res)
    })
    it('11) Testing \'/h1bWsState\' without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "ID" }
        await request(app).get('/h1bWsState').send(query).expect(200)
    })
    it('12) Testing \'/h1bWsState\' with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        // logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "WY" }
        await request(app).get('/h1bWsState').send(query).expect(200)
    })
    it('13) Testing \'/h1bWsState\' with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        // logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2011, WORKSITE_STATE: "AK" }
        await request(app).get('/h1bWsState').send(query).expect(200)
    })
    it('14) Testing \'/h1bWsState\' with invalid year', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2009, WORKSITE_STATE: "WY" }
        await request(app).get('/h1bWsState').send(query).expect(500)
    })
    it('15) Testing \'/h1bSummary\' without key in summaryMap', async () => {
        summaryMap = {}
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2016, WORKSITE_STATE: "ID" }
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('16) Testing \'/h1bSummary\' with undefined summaryMap', async () => {
        summaryMap = undefined
        expect(_.isEmpty(summaryMap)).to.be.true
        // logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "WY" }
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('17) Testing \'/h1bSummary\' with key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        // logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2010, WORKSITE_STATE: "AK" }
        await request(app).get('/h1bSummary').send(query).expect(200)
    })
    it('18) Testing \'/h1bSummary\' with invalid year', async () => {
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2007, WORKSITE_STATE: "WY" }
        await request(app).get('/h1bSummary').send(query).expect(500)
    })
})   

