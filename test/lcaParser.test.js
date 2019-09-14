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

const {sortWithField, sortWorksiteAddr1, sortWorksiteAddr2, sortWorksiteCity,
            sortWorksiteCounty, sortWorksiteState, sortEmployerName,
            sortEmployerAddress, sortEmployerCity, sortEmployerState,
            sortJobTitle, sortSocCode
        }
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
    it('2) test sortWorksiteAddr1', () => {
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
    it('3) test sortWorksiteAddr2', () => {
        var a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWorksiteAddr2(a, b))
        expect(0).to.be.equal(sortWorksiteAddr2(b, a))

        a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR2": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteAddr2(a, b))
        expect(0).to.be.below(sortWorksiteAddr2(b, a))

        a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR2": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteAddr2(a, b))
        expect(0).to.be.below(sortWorksiteAddr2(b, a))

        a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR2": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteAddr2(a, b))
        expect(0).to.be.above(sortWorksiteAddr2(b, a))

        a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_ADDR2": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWorksiteAddr2(a, b))
        expect(0).to.be.above(sortWorksiteAddr2(b, a))

        a = {"WORKSITE_ADDR2": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"WORKSITE_ADDR2": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteAddr2(a, b))
        expect(0).to.be.above(sortWorksiteAddr2(b, a))

    })    
    it('4) test sortWorksiteCity', () => {
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
    it('5) test sortWorksiteCounty', () => {
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
    it('6) test sortWorksiteState', () => {
        var a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortWorksiteState(a, b))
        expect(0).to.be.equal(sortWorksiteState(b, a))

        a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteState(a, b))
        expect(0).to.be.below(sortWorksiteState(b, a))

        a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"WORKSITE_STATE": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortWorksiteState(a, b))
        expect(0).to.be.below(sortWorksiteState(b, a))

        a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteState(a, b))
        expect(0).to.be.above(sortWorksiteState(b, a))

        a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"WORKSITE_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortWorksiteState(a, b))
        expect(0).to.be.above(sortWorksiteState(b, a))

        a = {"WORKSITE_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"WORKSITE_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortWorksiteState(a, b))
        expect(0).to.be.above(sortWorksiteState(b, a))

    })
    it('7) test sortEmployerName', () => {
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
    it('8) test sortEmployerAddress', () => {
        var a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortEmployerAddress(a, b))
        expect(0).to.be.equal(sortEmployerAddress(b, a))

        a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_ADDRESS": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerAddress(a, b))
        expect(0).to.be.below(sortEmployerAddress(b, a))

        a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_ADDRESS": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerAddress(a, b))
        expect(0).to.be.below(sortEmployerAddress(b, a))

        a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_ADDRESS": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerAddress(a, b))
        expect(0).to.be.above(sortEmployerAddress(b, a))

        a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_ADDRESS": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortEmployerAddress(a, b))
        expect(0).to.be.above(sortEmployerAddress(b, a))

        a = {"EMPLOYER_ADDRESS": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"EMPLOYER_ADDRESS": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerAddress(a, b))
        expect(0).to.be.above(sortEmployerAddress(b, a))

    })
    it('9) test sortEmployerCity', () => {
        var a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortEmployerCity(a, b))
        expect(0).to.be.equal(sortEmployerCity(b, a))

        a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerCity(a, b))
        expect(0).to.be.below(sortEmployerCity(b, a))

        a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_CITY": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerCity(a, b))
        expect(0).to.be.below(sortEmployerCity(b, a))

        a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerCity(a, b))
        expect(0).to.be.above(sortEmployerCity(b, a))

        a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortEmployerCity(a, b))
        expect(0).to.be.above(sortEmployerCity(b, a))

        a = {"EMPLOYER_CITY": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"EMPLOYER_CITY": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerCity(a, b))
        expect(0).to.be.above(sortEmployerCity(b, a))

    })
    it('10) test sortEmployerState', () => {
        var a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortEmployerState(a, b))
        expect(0).to.be.equal(sortEmployerState(b, a))

        a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerState(a, b))
        expect(0).to.be.below(sortEmployerState(b, a))

        a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"EMPLOYER_STATE": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortEmployerState(a, b))
        expect(0).to.be.below(sortEmployerState(b, a))

        a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerState(a, b))
        expect(0).to.be.above(sortEmployerState(b, a))

        a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"EMPLOYER_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortEmployerState(a, b))
        expect(0).to.be.above(sortEmployerState(b, a))

        a = {"EMPLOYER_STATE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"EMPLOYER_STATE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortEmployerState(a, b))
        expect(0).to.be.above(sortEmployerState(b, a))

    })
    it('11) test sortJobTitle', () => {
        var a = {"JOB_TITLE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"JOB_TITLE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortJobTitle(a, b))
        expect(0).to.be.equal(sortJobTitle(b, a))

        a = {"JOB_TITLE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"JOB_TITLE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortJobTitle(a, b))
        expect(0).to.be.below(sortJobTitle(b, a))

        a = {"JOB_TITLE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"JOB_TITLE": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortJobTitle(a, b))
        expect(0).to.be.below(sortJobTitle(b, a))

        a = {"JOB_TITLE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"JOB_TITLE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortJobTitle(a, b))
        expect(0).to.be.above(sortJobTitle(b, a))

        a = {"JOB_TITLE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"JOB_TITLE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortJobTitle(a, b))
        expect(0).to.be.above(sortJobTitle(b, a))

        a = {"JOB_TITLE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"JOB_TITLE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortJobTitle(a, b))
        expect(0).to.be.above(sortJobTitle(b, a))

    })
    it('12) test sortSocCode', () => {
        var a = {"SOC_CODE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        var b = {"SOC_CODE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.equal(sortSocCode(a, b))
        expect(0).to.be.equal(sortSocCode(b, a))

        a = {"SOC_CODE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"SOC_CODE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortSocCode(a, b))
        expect(0).to.be.below(sortSocCode(b, a))

        a = {"SOC_CODE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        b = {"SOC_CODE": "x", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        expect(0).to.be.above(sortSocCode(a, b))
        expect(0).to.be.below(sortSocCode(b, a))

        a = {"SOC_CODE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"SOC_CODE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortSocCode(a, b))
        expect(0).to.be.above(sortSocCode(b, a))

        a = {"SOC_CODE": "a", TOTAL_WORKERS: 4, TOTAL_LCAS: 2}
        b = {"SOC_CODE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        expect(0).to.be.below(sortSocCode(a, b))
        expect(0).to.be.above(sortSocCode(b, a))

        a = {"SOC_CODE": "a", TOTAL_WORKERS: 5, TOTAL_LCAS: 1}
        b = {"SOC_CODE": "x", TOTAL_WORKERS: 5, TOTAL_LCAS: 2}
        expect(0).to.be.below(sortSocCode(a, b))
        expect(0).to.be.above(sortSocCode(b, a))

    })
    
 
})
