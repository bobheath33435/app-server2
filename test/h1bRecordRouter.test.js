const log4js = require('log4js')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const log = console.log;
const logger = log4js.getLogger('h1bData');
const chalk = require('chalk')
const sinon = require('sinon')
const modelMap = require('../src/models/dbRecords')
const { summarize, decompressSummaryRecord, readSummarizedQueries,
    createKey, summaryMap } = require('../src/utilities/summarize')

const { performQuery, processWsState } = require('../src/routers/h1bRecordRouter')

const expect = require('chai').expect
const _ = require('lodash')
const { compress, decompress } = require('../src/utilities/compression')

describe('Test h1bRecordRouter', () => {
    beforeEach(() => {
        log4js.configure({
            // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
            appenders: { h1bData: { type: 'console'} },
            categories: { default: { appenders: ['h1bData'], level: 'error' } }
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
    
    logger.trace('Testing performQuery()');
    it('1) Testing performQuery() without key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "WY" }
        const h1bSummary = await performQuery(query)
        logger.info(chalk.bgRed.white.bold(`Unit test result: ${JSON.stringify(h1bSummary)}`))
        expect(_.isEmpty(h1bSummary)).to.be.false
     })
     xit('2) Testing processWsState() without key in summaryMap', async () => {
        expect(_.isEmpty(summaryMap)).to.be.true
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "FL" }
        var req = {}
        req.body = query
        res = {}
        res.send = (msg) => { return msg; }
        res.status = (status) => { return res; }
        res.json = (msg) => {  return msg; }
        const h1bSummary = await processWsState(req, res)
        logger.info(chalk.bgRed.white.bold(`Unit test result: ${JSON.stringify(h1bSummary)}`))
        expect(_.isEmpty(h1bSummary)).to.be.false
    })
     it('3) Testing performQuery() with key in summaryMap', async () => {
        await readSummarizedQueries()
        expect(_.isEmpty(summaryMap)).to.be.false
        logger.trace(chalk.bgRed.white.bold(`summaryMap: ${JSON.stringify(summaryMap)}`))
        const query = { YEAR: 2017, WORKSITE_STATE: "WY" }
        const h1bSummary = await performQuery(query)
        logger.info(chalk.bgRed.white.bold(`Unit test result: ${JSON.stringify(h1bSummary)}`))
        expect(_.isEmpty(h1bSummary.status)).to.be.false
    })
})   
