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
const { app } = require('../src/app')
const expect = require('chai').expect
const sinon = require('sinon')
const _ = require('lodash')
const { summarize, createKey, calculatePercentiles, countItems, buildWageArray,
    compressSummaryRecord, decompressSummaryRecord
} 
        = require('../src/utilities/summarize')

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


    var query = { "YEAR": 2017 }
    describe('Test autocomplete data gathering', () => {
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
        it('1) Test autocomplete data gathering for WORKSITE_ADDR1', async() => {
            var query = {}
            query['key'] = WORKSITE_ADDR1
            const worksiteAddr1Response = await request(app).get('/autocomplete').send(query).expect(200)
            const addr1s = worksiteAddr1Response.body
            expect(_.isArray(addr1s)).to.be.true
            expect(598341).to.be.equal(addr1s.length)
            expect("1700 MARKET STREET").to.be.equal(addr1s[0][WORKSITE_ADDR1])
            expect(7893).to.be.equal(addr1s[0][TOTAL_LCAS])
            expect(94499).to.be.equal(addr1s[0][TOTAL_WORKERS])
            logger.trace(`length = ${worksiteAddr1Response.body.length}`)
        })
        it('2) Test autocomplete data gathering for WORKSITE_ADDR2', async() => {
            var query = {}
            query['key'] = WORKSITE_ADDR2
            const worksiteAddr2Response = await request(app).get('/autocomplete').send(query).expect(200)
            const addr2s = worksiteAddr2Response.body
            expect(_.isArray(addr2s)).to.be.true
            expect(155720).to.be.equal(addr2s.length)
            expect("").to.be.equal(addr2s[0][WORKSITE_ADDR2])
            expect(1963042).to.be.equal(addr2s[0][TOTAL_LCAS])
            expect(4279943).to.be.equal(addr2s[0][TOTAL_WORKERS])
            logger.trace(`length = ${worksiteAddr2Response.body.length}`)
        })
        it('3) Test autocomplete data gathering for WORKSITE_CITY', async() => {
            var query = {}
            query['key'] = WORKSITE_CITY
            const wsCity = await request(app).get('/autocomplete').send(query).expect(200)
            const cities = wsCity.body
            expect(_.isArray(cities)).to.be.true
            expect(20011).to.be.equal(cities.length)
            expect("NEW YORK").to.be.equal(cities[0][WORKSITE_CITY])
            expect(216554).to.be.equal(cities[0][TOTAL_LCAS])
            expect(385215).to.be.equal(cities[0][TOTAL_WORKERS])
            logger.trace(`length = ${cities.length}`)
        })
        it('4) Test autocomplete data gathering for WORKSITE_COUNTY', async() => {
            var query = {}
            query['key'] = WORKSITE_COUNTY
            const wsCounties = await request(app).get('/autocomplete').send(query).expect(200)
            const counties = wsCounties.body
            expect(_.isArray(counties)).to.be.true
            expect(10064).to.be.equal(counties.length)
            expect("SANTA CLARA").to.be.equal(counties[0][WORKSITE_COUNTY])
            expect(208935).to.be.equal(counties[0][TOTAL_LCAS])
            expect(530056).to.be.equal(counties[0][TOTAL_WORKERS])
            logger.trace(`length = ${counties.length}`)
        })
        it('5) Test autocomplete data gathering for WORKSITE_STATE', async() => {
            var query = {}
            query['key'] = WORKSITE_STATE
            const wsStates = await request(app).get('/autocomplete').send(query).expect(200)
            const states = wsStates.body
            expect(_.isArray(states)).to.be.true
            expect(59).to.be.equal(states.length)
            expect("CA").to.be.equal(states[0][WORKSITE_STATE])
            expect(633944).to.be.equal(states[0][TOTAL_LCAS])
            expect(1350855).to.be.equal(states[0][TOTAL_WORKERS])
            logger.trace(`length = ${states.length}`)
        })
        it('6) Test autocomplete data gathering for EMPLOYER_NAME', async() => {
            var query = {}
            query['key'] = EMPLOYER_NAME
            const employerNameResponse = await request(app).get('/autocomplete').send(query).expect(200)
            const employers = employerNameResponse.body
            expect(_.isArray(employers)).to.be.true
            expect(278993).to.be.equal(employers.length)
            expect("COGNIZANT TECHNOLOGY SOLUTIONS U.S. CORPORATION").to.be.equal(employers[0][EMPLOYER_NAME])
            expect(18922).to.be.equal(employers[0][TOTAL_LCAS])
            expect(432285).to.be.equal(employers[0][TOTAL_WORKERS])
            logger.trace(`length = ${employerNameResponse.body.length}`)
        })
        it('7) Test autocomplete data gathering for EMPLOYER_ADDRESS', async() => {
            var query = {}
            query['key'] = EMPLOYER_ADDRESS
            const empAddrs = await request(app).get('/autocomplete').send(query).expect(200)
            const addrs = empAddrs.body
            expect(_.isArray(addrs)).to.be.true
            expect(269512).to.be.equal(addrs.length)
            expect("1700 MARKET STREET").to.be.equal(addrs[0][EMPLOYER_ADDRESS])
            expect(62917).to.be.equal(addrs[0][TOTAL_LCAS])
            expect(585394).to.be.equal(addrs[0][TOTAL_WORKERS])
            logger.trace(`length = ${addrs.length}`)
        })
        it('8) Test autocomplete data gathering for EMPLOYER_CITY', async() => {
            var query = {}
            query['key'] = EMPLOYER_CITY
            const empCities = await request(app).get('/autocomplete').send(query).expect(200)
            const cities = empCities.body
            expect(_.isArray(cities)).to.be.true
            expect(10537).to.be.equal(cities.length)
            expect("PHILADELPHIA").to.be.equal(cities[0][EMPLOYER_CITY])
            expect(75429).to.be.equal(cities[0][TOTAL_LCAS])
            expect(600025).to.be.equal(cities[0][TOTAL_WORKERS])
            logger.trace(`length = ${cities.length}`)
        })
        it('9) Test autocomplete data gathering for EMPLOYER_STATE', async() => {
            var query = {}
            query['key'] = EMPLOYER_STATE
            const empStates = await request(app).get('/autocomplete').send(query).expect(200)
            const states = empStates.body
            expect(_.isArray(states)).to.be.true
            expect(59).to.be.equal(states.length)
            expect("CA").to.be.equal(states[0][EMPLOYER_STATE])
            expect(564858).to.be.equal(states[0][TOTAL_LCAS])
            expect(1240920).to.be.equal(states[0][TOTAL_WORKERS])
            logger.trace(`length = ${states.length}`)
        })
        it('10) Test autocomplete data gathering for JOB_TITLE', async() => {
            var query = {}
            query['key'] = JOB_TITLE
            const jobTitles = await request(app).get('/autocomplete').send(query).expect(200)
            const jobs = jobTitles.body
            expect(_.isArray(jobs)).to.be.true
            expect(346808).to.be.equal(jobs.length)
            expect("PROGRAMMER ANALYST").to.be.equal(jobs[0][JOB_TITLE])
            expect(289890).to.be.equal(jobs[0][TOTAL_LCAS])
            expect(665171).to.be.equal(jobs[0][TOTAL_WORKERS])
            logger.trace(`length = ${jobs.length}`)
        })
        it('11) Test autocomplete data gathering for SOC_CODE', async() => {
            var query = {}
            query['key'] = SOC_CODE
            const jobTitles = await request(app).get('/autocomplete').send(query).expect(200)
            const jobs = jobTitles.body
            expect(_.isArray(jobs)).to.be.true
            expect(2020).to.be.equal(jobs.length)
            expect("15-1121").to.be.equal(jobs[0][SOC_CODE])
            expect(548080).to.be.equal(jobs[0][TOTAL_LCAS])
            expect(1633102).to.be.equal(jobs[0][TOTAL_WORKERS])
            logger.trace(`length = ${jobs.length}`)
        })
        it('12) Test autocomplete data gathering for WAGE_LEVEL', async() => {
            var query = {}
            query['key'] = WAGE_LEVEL
            const wageLevels = await request(app).get('/autocomplete').send(query).expect(200)
            const wlevels = wageLevels.body
            expect(_.isArray(wlevels)).to.be.true
            expect(6).to.be.equal(wlevels.length)
            expect("Level I").to.be.equal(wlevels[0][WAGE_LEVEL])
            expect(1492457).to.be.equal(wlevels[0][TOTAL_LCAS])
            expect(2830753).to.be.equal(wlevels[0][TOTAL_WORKERS])
            logger.trace(`length = ${wlevels.length}`)
        })
    })
