const log = console.log;
const chalk = require('chalk')
const expect = require('chai').expect
const { summarize, createKey } = require('../src/utilities/summarize')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    UNSPECIFIED, h1bRecord } 
        = require('../src/models/h1bRecordSchema')

describe('Test createKey', () => {
    it('1) createKey should create a key with {"YEAR": "xyz"}', () => {
        const key = createKey({'YEAR': "xyz"})
        expect("xyz").to.equal(key)
    })
    
    it('2) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA"}', () => {
        const key = createKey({"YEAR": "xyz", "WORKSITE_STATE": "CA"})
        expect("xyz_CA").to.equal(key)
    })  
    
    it('3) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA", "WORKSITE_COUNTY": "SANTA CLARA ABC"}', () => {
        const key = createKey({"YEAR": "xyz", 
            "WORKSITE_STATE": "CA",
            "WORKSITE_COUNTY": "SANTA CLARA ABC"})
        expect("xyz_CA_SANTA_CLARA_ABC").to.equal(key)
    })
    
    it('4) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA", "WORKSITE_COUNTY": "SANTA CLARA ABC", "WORKSITE_CITY": "SAN JOSE"}', () => {
        const key = createKey({"YEAR": "xyz", 
            "WORKSITE_STATE": "CA",
            "WORKSITE_COUNTY": "SANTA CLARA ABC",
            "WORKSITE_CITY": "SAN JOSE"
        })
        expect(null).to.equal(key)
    })
              
})
describe('Test summarize', () => {

    var h1bRecords = [
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 2},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 3},
        {WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 5},
        {WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 7},
        {WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 11},
        {WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 17},
        {TOTAL_WORKERS: 23},
        {},
        {CASE_NUMBER: "12345"}
    ]

    beforeEach(() => {
    })
    
    it('1) summarize should summarize h1bRecords', () => {
        const summary = summarize(h1bRecords)
        // log(summary)
        expect(13).to.equal(summary[LEVEL_1])
        expect(20).to.equal(summary[LEVEL_2])
        expect(5).to.equal(summary[LEVEL_3])
        expect(7).to.equal(summary[LEVEL_4])
        expect(23).to.equal(summary[UNSPECIFIED])
        expect(9).to.equal(summary[TOTAL_LCAS])
        expect(68).to.equal(summary[TOTAL_WORKERS])
    })
        
})
