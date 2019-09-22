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
const { userRouter } 
            = require('../src/routers/userRouter')
const { app } = require('../src/app')
const expect = require('chai').expect
const sinon = require('sinon')

const _ = require('lodash')
const { compress, decompress } = require('../src/utilities/compression')
const { userSchema, userName, password, email, firstName, lastName,
    subscriptionDate, membershipDate, role, orginization, purpose, 
    phone, key, status} = require('../src/models/userSchema')

describe('Test UserRouter', () => {
    describe('Test UserRouter', () => {
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
        logger.trace('Testing /register');
        it('1) Testing /register without clientData', async () => {
            var query = {}
            query['YEAR'] = 123
            query['WORKSITE_STATE'] = "NY"
            response = await request(app).post('/register').send(query).expect(500)
            logger.trace(chalk.bgRed.white.bold(`response: ${JSON.stringify(response.text)}`))
            expect(userRouter.NO_CLIENT_DATA).to.be.equal(response.text)
        })
        it('2) Testing /register', async () => {
            var clientData = {}
            clientData[firstName] = "Ward"
            clientData[lastName] = "Bond"
            clientData[email] = "ward@xxx.com"
            clientData[userName] = "wmatt"
            var body = { clientData }
            response = await request(app).post('/register').send(body).expect(200)
            logger.trace(chalk.bgRed.white.bold(`response: ${JSON.stringify(response.text)}`))
            expect("Gotcha").to.be.equal(response.text)
        })
    })
})   

