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

const {sortWithField, sortEmployerName, sortWorksiteAddr1, sortWorksiteCity,
            sortWorksiteCounty}
                 = require('../src/utilities/lcaParser')
const { compress, decompress } = require('../src/utilities/compression')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, H1B_DEPENDENT,
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_WAGE_RATE_OF_PAY, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

describe('Test autoComplete sorts', () => {
    logger.trace('testing sortWithField');
    it('1) test sortWithField', () => {
        var a = {"banana": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"banana": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWithField(a, b, "banana"))
        expect(0).to.be.equal(sortWithField(b, a, "banana"))

        a = {"banana": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"banana": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWithField(a, b, "banana"))
        expect(0).to.be.below(sortWithField(b, a, "banana"))

        a = {"banana": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"banana": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWithField(a, b, "banana"))
        expect(0).to.be.below(sortWithField(b, a, "banana"))

        a = {"banana": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"banana": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWithField(a, b, "banana"))
        expect(0).to.be.above(sortWithField(b, a, "banana"))

        a = {"banana": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"banana": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWithField(a, b, "banana"))
        expect(0).to.be.above(sortWithField(b, a, "banana"))

        a = {"banana": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"banana": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWithField(a, b, "banana"))
        expect(0).to.be.above(sortWithField(b, a, "banana"))

    })
    it('2) test sortWorksiteCity', () => {
        var a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWorksiteCity(a, b))
        expect(0).to.be.equal(sortWorksiteCity(b, a))

        a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteCity(a, b))
        expect(0).to.be.below(sortWorksiteCity(b, a))

        a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_CITY": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteCity(a, b))
        expect(0).to.be.below(sortWorksiteCity(b, a))

        a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteCity(a, b))
        expect(0).to.be.above(sortWorksiteCity(b, a))

        a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWorksiteCity(a, b))
        expect(0).to.be.above(sortWorksiteCity(b, a))

        a = {"WORKSITE_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"WORKSITE_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteCity(a, b))
        expect(0).to.be.above(sortWorksiteCity(b, a))

    })
    it('3) test sortWorksiteCounty', () => {
        var a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWorksiteCounty(a, b))
        expect(0).to.be.equal(sortWorksiteCounty(b, a))

        a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_COUNTY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteCounty(a, b))
        expect(0).to.be.below(sortWorksiteCounty(b, a))

        a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_COUNTY": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteCounty(a, b))
        expect(0).to.be.below(sortWorksiteCounty(b, a))

        a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_COUNTY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteCounty(a, b))
        expect(0).to.be.above(sortWorksiteCounty(b, a))

        a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_COUNTY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWorksiteCounty(a, b))
        expect(0).to.be.above(sortWorksiteCounty(b, a))

        a = {"WORKSITE_COUNTY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"WORKSITE_COUNTY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteCounty(a, b))
        expect(0).to.be.above(sortWorksiteCounty(b, a))

    })
    it('4) test sortEmployerName', () => {
        var a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortEmployerName(a, b))
        expect(0).to.be.equal(sortEmployerName(b, a))

        a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_NAME": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerName(a, b))
        expect(0).to.be.below(sortEmployerName(b, a))

        a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_NAME": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerName(a, b))
        expect(0).to.be.below(sortEmployerName(b, a))

        a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_NAME": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerName(a, b))
        expect(0).to.be.above(sortEmployerName(b, a))

        a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_NAME": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortEmployerName(a, b))
        expect(0).to.be.above(sortEmployerName(b, a))

        a = {"EMPLOYER_NAME": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"EMPLOYER_NAME": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerName(a, b))
        expect(0).to.be.above(sortEmployerName(b, a))

    })
    it('5) test sortWorksiteAddr1', () => {
        var a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWorksiteAddr1(a, b))
        expect(0).to.be.equal(sortWorksiteAddr1(b, a))

        a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR1": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteAddr1(a, b))
        expect(0).to.be.below(sortWorksiteAddr1(b, a))

        a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR1": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteAddr1(a, b))
        expect(0).to.be.below(sortWorksiteAddr1(b, a))

        a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR1": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteAddr1(a, b))
        expect(0).to.be.above(sortWorksiteAddr1(b, a))

        a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR1": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWorksiteAddr1(a, b))
        expect(0).to.be.above(sortWorksiteAddr1(b, a))

        a = {"WORKSITE_ADDR1": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"WORKSITE_ADDR1": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteAddr1(a, b))
        expect(0).to.be.above(sortWorksiteAddr1(b, a))

    })
    
 
})
