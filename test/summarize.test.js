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
const { summarize, createKey, calculatePercentiles, countItems, buildWageArray,
    compressSummaryRecord, decompressSummaryRecord, sortLatLng, sortInstanceKey,
    sortInstanceArray
} 
        = require('../src/utilities/summarize')
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

describe('Test createKey', () => {
    logger.trace('testing createKey');
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
        expect('xyz_CA_SAN_JOSE_SANTA_CLARA_ABC').to.equal(key)
    })             
    it('5) createKey should create a key with {"YEAR": "xyz", "WORKSITE_STATE": "CA", "WORKSITE_COUNTY": "SANTA CLARA ABC", "WORKSITE_CITY": "SAN JOSE", "EMPLOYER_ADDRESS": "123 MAIN ST"}', () => {
        const key = createKey({"YEAR": "xyz", 
            "WORKSITE_STATE": "CA",
            "WORKSITE_COUNTY": "SANTA CLARA ABC",
            "WORKSITE_CITY": "SAN JOSE",
            "EMPLOYER_ADDRESS": "123 MAIN ST"
        })
        expect(null).to.equal(key)
    })             
})

describe('Test sort routine', () => {
    it('1) Test sortLatLng() sort routine', () => {
 
            var a = {"count": 1}
            var b = {"count": 2}

        expect(0).to.be.below(sortLatLng(a, b))
        expect(0).to.be.above(sortLatLng(b, a))

            a = {"count": 2},
            b = {"count": 2}

        expect(0).to.be.equal(sortLatLng(a, b))

            a = {"count": 2, lat: 1},
            b = {"count": 2, lat: 1}

        expect(0).to.be.equal(sortLatLng(b, a))

            a = {"count": 2, lat: 1, lng: 5},
            b = {"count": 2, lat: 1, lng: 5}

        expect(0).to.be.equal(sortLatLng(b, a))

            a = {"count": 2},
            b = {"count": 2, lat: 3}

        expect(0).to.be.below(sortLatLng(a, b))

            a = {"count": 2, lat: 3},
            b = {"count": 2}

        expect(0).to.be.above(sortLatLng(a, b))

            a = {"count": 2, lat: 2},
            b = {"count": 2, lat: 3}

        expect(0).to.be.below(sortLatLng(a, b))

            a = {"count": 2, lat: 4},
            b = {"count": 2, lat: 3}

        expect(0).to.be.above(sortLatLng(a, b))

            a = {"count": 2, lat: 1},
            b = {"count": 2, lat: 1, lng: 8}

        expect(0).to.be.below(sortLatLng(a, b))

            a = {"count": 2, lat: 1, lng: 8}
            b = {"count": 2, lat: 1}

        expect(0).to.be.above(sortLatLng(a, b))
    })
    
    it('2) Test sortInstanceKey() sort routine', () => {

            a = {"count": 1}
            b = {"count": 2}

        expect(0).to.be.below(sortInstanceKey(a, b))
        expect(0).to.be.above(sortInstanceKey(b, a))

            a = {"count": 2},
            b = {"count": 2}

        expect(0).to.be.equal(sortInstanceKey(b, a))

            a = {"count": 2, EMPLOYER_NAME: "abc"}
            b = {"count": 2, EMPLOYER_NAME: "abc"}

        expect(0).to.be.equal(sortInstanceKey(b, a))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"},
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}

        expect(0).to.be.equal(sortInstanceKey(b, a))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR1: "bbb"},
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR1: "bbb"}

        expect(0).to.be.equal(sortInstanceKey(b, a))

            a = {"count": 2, EMPLOYER_NAME: "abc"}
            b = {"count": 2, EMPLOYER_NAME: "xyz"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc"}
            b = {"count": 2}

        expect(0).to.be.above(sortInstanceKey(a, b))

            a = {"count": 2}
            b = {"count": 2, EMPLOYER_NAME: "abc"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}
            b = {"count": 2, EMPLOYER_NAME: "abc"}

        expect(0).to.be.above(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "bbb"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "cccc"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "bbb"}

        expect(0).to.be.above(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "bbb"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}

        expect(0).to.be.above(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "bbb"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "bbb"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "ccc"}

        expect(0).to.be.below(sortInstanceKey(a, b))

            a = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "ddd"}
            b = {"count": 2, EMPLOYER_NAME: "abc", WORKSITE_ADDR1: "aaa", WORKSITE_ADDR2: "ccc"}

        expect(0).to.be.above(sortInstanceKey(a, b))
    })
    
    it('3) Test sortInstanceArray() sort routine', () => {
        var a = { TOTAL_WORKERS: 2}
        var b = { TOTAL_WORKERS: 3}
        expect(0).to.be.below(sortInstanceArray(a, b))
        expect(0).to.be.above(sortInstanceArray(b, a))

        var a = { TOTAL_WORKERS: 2}
        var b = { TOTAL_WORKERS: 3}
        expect(0).to.be.below(sortInstanceArray(a, b))

        var a = { TOTAL_WORKERS: 2, CASE_NUMBER: "aa"}
        var b = { TOTAL_WORKERS: 2, CASE_NUMBER: "bb"}
        expect(0).to.be.below(sortInstanceArray(a, b))
        expect(0).to.be.above(sortInstanceArray(b, a))

        var a = { TOTAL_WORKERS: 2, CASE_NUMBER: "aa"}
        var b = { TOTAL_WORKERS: 2}
        expect(0).to.be.above(sortInstanceArray(a, b))

        var a = { TOTAL_WORKERS: 2}
        var b = { TOTAL_WORKERS: 2, CASE_NUMBER: "aa"}
        expect(0).to.be.below(sortInstanceArray(a, b))

        var a = { TOTAL_WORKERS: 3}
        var b = { TOTAL_WORKERS: 2, CASE_NUMBER: "aa"}
        expect(0).to.be.above(sortInstanceArray(a, b))

        var a = { TOTAL_WORKERS: 2}
        var b = { TOTAL_WORKERS: 3, CASE_NUMBER: "aa"}
        expect(0).to.be.below(sortInstanceArray(a, b))

    })

})

describe('Test summarize', () => {
    logger.trace('testing summarize');
    var query = {
        "YEAR": 123,
        "EMPLOYER_NAME": "HIWAY DEPT",
        "WORKSITE_CITY": "Boise",
        "WORKSITE_COUNTY": "Orange",
        "WORKSITE_STATE": "Shock"
    }
    var h1bRecords = [
        {i: 0, WAGE_LEVEL: LEVEL_3, TOTAL_WORKERS: 5, CHANGE_PREVIOUS_EMPLOYMENT: 7,
            ANNUALIZED_WAGE_RATE_OF_PAY: 600, SOC_CODE: "xyz", CASE_NUMBER: "111", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "GG", WORKSITE_LATITUDE: 6, WORKSITE_LONGITUDE: 4},
        {i: 1, WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 3, CONTINUED_EMPLOYMENT: 3,
            ANNUALIZED_WAGE_RATE_OF_PAY: 500, SOC_CODE: "abc", CASE_NUMBER: "222", H1B_DEPENDENT: "Y",
            WORKSITE_LATITUDE: 5, WORKSITE_LATITUDE: 8},
        {i: 2, WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 2, NEW_EMPLOYMENT: 5, CHANGE_PREVIOUS_EMPLOYMENT: 1,
            ANNUALIZED_WAGE_RATE_OF_PAY: 150, SOC_CODE: "123", CASE_NUMBER: "333", H1B_DEPENDENT: "C",
            EMPLOYER_NAME: "AA", WORKSITE_LATITUDE: 5, WORKSITE_LONGITUDE: 8},
        {i: 3, WAGE_LEVEL: LEVEL_4, TOTAL_WORKERS: 7, NEW_CONCURRENT_EMPLOYMENT: 1, CONTINUED_EMPLOYMENT: 4000,
            ANNUALIZED_WAGE_RATE_OF_PAY: 400, SOC_CODE: "xyz", CASE_NUMBER: "444", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "GG", WORKSITE_LATITUDE: 6, WORKSITE_LONGITUDE: 4},
        {i: 4, WAGE_LEVEL: LEVEL_1, TOTAL_WORKERS: 11, CHANGE_EMPLOYER: 14, AMENDED_PETITION: 77,
            ANNUALIZED_WAGE_RATE_OF_PAY: 200, SOC_CODE: "abc", CASE_NUMBER: "555", H1B_DEPENDENT: "R",
            EMPLOYER_NAME: "TT", WORKSITE_LATITUDE: 1, WORKSITE_LONGITUDE: 3},
        {i: 5, WAGE_LEVEL: LEVEL_2, TOTAL_WORKERS: 17,  NEW_EMPLOYMENT: 7,
            ANNUALIZED_WAGE_RATE_OF_PAY: 300, SOC_CODE: "123", CASE_NUMBER: "666", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "TT", WORKSITE_LATITUDE: 1, WORKSITE_LONGITUDE: 3},
        {i: 6, TOTAL_WORKERS: 23, AMENDED_PETITION: 5,
            ANNUALIZED_WAGE_RATE_OF_PAY: 10000, SOC_CODE: "123", CASE_NUMBER: "777", H1B_DEPENDENT: "Y",
            EMPLOYER_NAME: "TT", WORKSITE_ADDR1: "addr1", WORKSITE_ADDR2: "addr2", 
            WORKSITE_LATITUDE: 1, WORKSITE_LONGITUDE: 3},
        {i: 7,  CASE_NUMBER: "888", H1B_DEPENDENT: "Y"},
        {i: 8, CASE_NUMBER: "12345", H1B_DEPENDENT: "Y"}
    ]

    var summary = {}
    beforeEach(() => {
        summary = summarize(h1bRecords, query)
    })
    
    it('1) test summarized h1bRecords', () => {
        testSummary(summary)
    })
    
    it('2) test summarized h1bRecords after summarize, compress, and then decompress', () => {
        const compressedSummary = compress(summary)
        const decompressedSummary = decompress(compressedSummary)
        testSummary(decompressedSummary)
    })
    
    it('3) test summarized h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })
    
    it('4) test summarized reordered h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        summary = summarize(h1bRecords, query)
        const newH1bRecords = reOrderArray(h1bRecords)
        summary = summarize(newH1bRecords, query)
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })

    it('5) test summarized reordered h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        summary = summarize(h1bRecords, query)
        const newH1bRecords = reOrderArray(h1bRecords)
        summary = summarize(newH1bRecords, query)
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })

    it('6) test summarized reordered h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        summary = summarize(h1bRecords, query)
        const newH1bRecords = reOrderArray(h1bRecords)
        summary = summarize(newH1bRecords, query)
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })

    it('7) test summarized reordered, reordered h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        summary = summarize(h1bRecords, query)
        const newH1bRecords = reOrderArray(reOrderArray(h1bRecords))
        summary = summarize(newH1bRecords, query)
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })

    it('8) test summarized reordered, reordered, reordered h1bRecords after summarize, compressSummaryRecord, and then decompressSummaryRecord', () => {
        summary = summarize(h1bRecords, query)
        const newH1bRecords = reOrderArray(reOrderArray(reOrderArray(h1bRecords)))
        summary = summarize(newH1bRecords, query)
        const compressedSummary = compressSummaryRecord(summary)
        const decompressedSummary = decompressSummaryRecord(compressedSummary)
        testSummary(decompressedSummary)
    })
})

describe('Test calculatePercentiles', () => {
    logger.trace('testing calculatePercentiles');
    it('1) calculatePercentiles should find percentile levels of array of 100 Numbers', () => {
        var wageMap = {}
        for(var i = 0; i < 100; ++i){
            wageMap[i] = 1
        }
        logger.trace("wageMap: " + JSON.stringify(wageMap, undefined, 2))
        const levels = calculatePercentiles(wageMap)
        logger.trace("levels: " + JSON.stringify(levels, undefined, 2))
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(10)
        expect(levels['25%']).to.equal(25)
        expect(levels['50%']).to.equal(50)
        expect(levels['75%']).to.equal(74)
        expect(levels['90%']).to.equal(89)
        expect(levels['100%']).to.equal(99)

    })
        
    it('2) calculatePercentiles should find percentile levels of array of 9 Numbers', () => {
        var wageMap = {}
        for(var i = 0; i < 9; ++i){
            wageMap[i] = 1
        }
        const levels = calculatePercentiles(wageMap)
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(1)
        expect(levels['25%']).to.equal(2)
        expect(levels['50%']).to.equal(4)
        expect(levels['75%']).to.equal(6)
        expect(levels['90%']).to.equal(7)
        expect(levels['100%']).to.equal(8)
    })
        
    it('3) calculatePercentiles should find percentile levels of array of 11 Numbers', () => {
        var wageMap = {}
        for(var i = 0; i < 11; ++i){
            wageMap[i] = 1
        }
        const levels = calculatePercentiles(wageMap)
        expect(levels['0%']).to.equal(0)
        expect(levels['10%']).to.equal(1)
        expect(levels['25%']).to.equal(3)
        expect(levels['50%']).to.equal(5)
        expect(levels['75%']).to.equal(8)
        expect(levels['90%']).to.equal(9)
        expect(levels['100%']).to.equal(10)
    })
        
})

describe('Test countItems', () => {
    logger.trace('testing countItems');
    it('1) test countItems with 99 Numbers', () => {
        var array = []
        for(var i = 0; i < 99; ++i){
            array.push(5)
        }
        var count = countItems(array, 5)
        expect(count).to.equal(99)
    })
    it('2) test countItems with 0 Numbers', () => {
        var array = []
        for(var i = 0; i < 99; ++i){
            array.push(5)
        }
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
    it('3) test countItems with empty array', () => {
        var array = []
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
    it('4) test countItems with undefined array', () => {
        var array = undefined
        var count = countItems(array, 7)
        expect(count).to.equal(0)
    })
})

describe('Test compress/decompress', () => {
    logger.trace('testing countItems');
    it('1) test compress/decompress with String', () => {

        const str = "a string to test"
        const compressedString = compress(str)
        const decompessedString = decompress(compressedString)
        expect(str).to.equal(decompessedString)
    })
    it('2) test compress/decompress with array', () => {
        const array = [5, 6, "XXX", true, {}]
        const compressedArray = compress(array)
        const decompessedArray = decompress(compressedArray)
        expect(array).to.deep.equal(decompessedArray)
    })
    it('3) test compress/decompress with number', () => {
        const number = 999
        const compressedNumber = compress(number)
        const decompressedNumber = decompress(compressedNumber)
        expect(number).to.deep.equal(decompressedNumber)
    })
    it('4) test compress/decompress with object', () => {
        const obj = { "XYZ": 6, "ABC": 123, "ARRAY": [1, 2, "XXX"]}
        const compressedObject = compress(obj)
        const decompessedObject = decompress(compressedObject)
        expect(obj).to.deep.equal(decompessedObject)
    })
})

const testSummary = (summary) => {
    logger.trace(chalk.bgRed(`summary: ${JSON.stringify(summary, undefined, 2)}`))
    summary = testHeaders(summary)
    summary = testWageMap(summary)
    summary = testPercentiles(summary)
    summary = testCategories(summary)
    summary = testWageLevels(summary)
    summary = testOccupations(summary)
    summary = testLatLngs(summary)

    logger.trace("summary: " + JSON.stringify(summary, undefined, 2))
    expect(_.isEmpty(summary)).to.be.true
}

const testHeaders = (summary) => {
    expect(9).to.equal(summary[TOTAL_LCAS])
    delete summary[TOTAL_LCAS]
    expect(68).to.equal(summary[TOTAL_WORKERS])
    delete summary[TOTAL_WORKERS]
    expect(123).to.equal(summary[YEAR])
    delete summary[YEAR]
    expect("HIWAY DEPT").to.equal(summary[EMPLOYER_NAME])
    delete summary[EMPLOYER_NAME]
    expect("Boise").to.equal(summary[WORKSITE_CITY])
    delete summary[WORKSITE_CITY]
    expect("Orange").to.equal(summary[WORKSITE_COUNTY])
    delete summary[WORKSITE_COUNTY]
    expect("Shock").to.equal(summary[WORKSITE_STATE])
    delete summary[WORKSITE_STATE]
    expect(7).to.equal(Object.getOwnPropertyNames(summary.wageMap).length)    
    return summary
}

const testWageMap = (summary) => {
    var wageArray = buildWageArray(summary.wageMap)
    logger.trace("summary: " + JSON.stringify(summary, undefined, 2))
    var count = countItems(wageArray, 150)
    expect(2).to.equal(count)
    logger.trace("count for 200: " + count)
    count = countItems(wageArray, 200)
    expect(11).to.equal(count)
    count = countItems(wageArray, 300)
    logger.trace("count for 300: " + count)
    expect(17).to.equal(count)
    count = countItems(wageArray, 600)
    expect(5).to.equal(count)
    count = countItems(wageArray, 500)
    expect(3).to.equal(count)
    count = countItems(wageArray, 400)
    expect(7).to.equal(count)
    count = countItems(wageArray, 10000)
    expect(23).to.equal(count)
    delete summary['wageMap']
    return summary    
}

const testPercentiles = (summary) => {
    logger.trace("summary: " + JSON.stringify(summary.percentiles, undefined, 2))
    expect(150).to.equal(summary.percentiles['0%'])
    expect(200).to.equal(summary.percentiles['10%'])
    expect(300).to.equal(summary.percentiles['25%'])
    expect(400).to.equal(summary.percentiles['50%'])
    expect(10000).to.equal(summary.percentiles['75%'])
    expect(10000).to.equal(summary.percentiles['90%'])
    expect(10000).to.equal(summary.percentiles['100%'])
    delete summary.percentiles['0%']
    delete summary.percentiles['10%']
    delete summary.percentiles['25%']
    delete summary.percentiles['50%']
    delete summary.percentiles['75%']
    delete summary.percentiles['90%']
    delete summary.percentiles['100%']
    expect(_.isEmpty(summary.percentiles)).to.be.true
    delete summary['percentiles']
    return summary
}

const testCategories = (summary) => {
    expect(12).to.equal(summary.categories[NEW_EMPLOYMENT])
    expect(4003).to.equal(summary.categories[CONTINUED_EMPLOYMENT])
    expect(8).to.equal(summary.categories[CHANGE_PREVIOUS_EMPLOYMENT])
    expect(1).to.equal(summary.categories[NEW_CONCURRENT_EMPLOYMENT])
    expect(14).to.equal(summary.categories[CHANGE_EMPLOYER])
    expect(82).to.equal(summary.categories[AMENDED_PETITION])
    delete summary.categories[NEW_EMPLOYMENT]
    delete summary.categories[CONTINUED_EMPLOYMENT]
    delete summary.categories[CHANGE_PREVIOUS_EMPLOYMENT]
    delete summary.categories[NEW_CONCURRENT_EMPLOYMENT]
    delete summary.categories[CHANGE_EMPLOYER]
    delete summary.categories[AMENDED_PETITION]
    expect(_.isEmpty(summary.categories)).to.be.true
    delete summary.categories
    return summary   
}

const testWageLevels = (summary) => {
    expect(13).to.equal(summary.wageLevels.workers[LEVEL_1])
    expect(2).to.equal(summary.wageLevels.lcas[LEVEL_1])
    expect(20).to.equal(summary.wageLevels.workers[LEVEL_2])
    expect(2).to.equal(summary.wageLevels.lcas[LEVEL_2])
    expect(5).to.equal(summary.wageLevels.workers[LEVEL_3])
    expect(1).to.equal(summary.wageLevels.lcas[LEVEL_3])
    expect(7).to.equal(summary.wageLevels.workers[LEVEL_4])
    expect(1).to.equal(summary.wageLevels.lcas[LEVEL_4])
    expect(23).to.equal(summary.wageLevels.workers[UNSPECIFIED])
    expect(1).to.equal(summary.wageLevels.lcas[UNSPECIFIED])
    
    delete summary.wageLevels.workers[LEVEL_1]
    delete summary.wageLevels.workers[LEVEL_2]
    delete summary.wageLevels.workers[LEVEL_3]
    delete summary.wageLevels.workers[LEVEL_4]
    delete summary.wageLevels.workers[UNSPECIFIED]
    expect(_.isEmpty(summary.wageLevels.workers)).to.be.true
    delete summary.wageLevels.workers
    delete summary.wageLevels.lcas[LEVEL_1]
    delete summary.wageLevels.lcas[LEVEL_2]
    delete summary.wageLevels.lcas[LEVEL_3]
    delete summary.wageLevels.lcas[LEVEL_4]
    delete summary.wageLevels.lcas[UNSPECIFIED]
    expect(_.isEmpty(summary.wageLevels.lcas)).to.be.true
    delete summary.wageLevels.lcas
    expect(_.isEmpty(summary.wageLevels)).to.be.true
    delete summary.wageLevels
    return summary    
}

const testOccupations = (summary) => {
    const occupations = summary.occupations
    var occRecords = Object.getOwnPropertyNames(occupations)
    expect(3).to.equal(occRecords.length)
    occRecords = occRecords.sort()
    expect(occRecords[0]).equals("123")
    expect(occRecords[1]).equals("abc")
    expect(occRecords[2]).equals("xyz")
    
    var data = occupations[occRecords[0]].data
    var socCode = data["SOC_CODE"]
    expect("123").to.equal(socCode)
    delete occupations[occRecords[0]].data["SOC_CODE"]
    // wageArray = data.wageArray.sort((a, b) => a[TOTAL_WORKERS] - b[TOTAL_WORKERS])
    wageArray = buildWageArray(data.wageMap)
    logger.trace(`wageArray - ${JSON.stringify(wageArray)}`)
    expect(42).to.equal(wageArray.length)
    expect(2).to.equal(countItems(wageArray, 150))
    expect(17).to.equal(countItems(wageArray, 300))
    expect(23).to.equal(countItems(wageArray, 10000))
    delete occupations[occRecords[0]].data.wageMap
    var percentiles = Object.getOwnPropertyNames(data.percentiles)
    logger.trace(chalk.bgRed("Percentiles: " + percentiles))
    expect(7).to.equal(percentiles.length)
    expect('0%').to.equal(percentiles[0])
    expect('10%').to.equal(percentiles[1])
    expect('25%').to.equal(percentiles[2])
    expect('50%').to.equal(percentiles[3])
    expect('75%').to.equal(percentiles[4])
    expect('90%').to.equal(percentiles[5])
    expect('100%').to.equal(percentiles[6])
    expect(150).to.equal(data.percentiles[percentiles[0]])
    expect(300).to.equal(data.percentiles[percentiles[1]])
    expect(300).to.equal(data.percentiles[percentiles[2]])
    expect(10000).to.equal(data.percentiles[percentiles[3]])
    expect(10000).to.equal(data.percentiles[percentiles[4]])
    expect(10000).to.equal(data.percentiles[percentiles[5]])
    expect(10000).to.equal(data.percentiles[percentiles[6]])
    delete occupations[occRecords[0]].data.percentiles
    
    data = occupations[occRecords[1]].data
    var socCode = data["SOC_CODE"]
    expect("abc").to.equal(socCode)
    delete occupations[occRecords[1]].data["SOC_CODE"]
    wageArray = buildWageArray(data.wageMap)
    expect(14).to.equal(wageArray.length)
    expect(3).to.equal(countItems(wageArray, 500))
    expect(11).to.equal(countItems(wageArray, 200))
    delete occupations[occRecords[1]].data.wageArray
    percentiles = Object.getOwnPropertyNames(data.percentiles)
    expect(7).to.equal(percentiles.length)
    expect('0%').to.equal(percentiles[0])
    expect('10%').to.equal(percentiles[1])
    expect('25%').to.equal(percentiles[2])
    expect('50%').to.equal(percentiles[3])
    expect('75%').to.equal(percentiles[4])
    expect('90%').to.equal(percentiles[5])
    expect('100%').to.equal(percentiles[6])
    expect(200).to.equal(data.percentiles[percentiles[0]])
    expect(200).to.equal(data.percentiles[percentiles[1]])
    expect(200).to.equal(data.percentiles[percentiles[2]])
    expect(200).to.equal(data.percentiles[percentiles[3]])
    expect(200).to.equal(data.percentiles[percentiles[4]])
    expect(500).to.equal(data.percentiles[percentiles[5]])
    expect(500).to.equal(data.percentiles[percentiles[6]])
    delete occupations[occRecords[1]].data.percentiles
    
    data = occupations[occRecords[2]].data
    var socCode = data["SOC_CODE"]
    expect("xyz").to.equal(socCode)
    delete occupations[occRecords[2]].data["SOC_CODE"]
    wageArray = buildWageArray(data.wageMap)
    expect(12).to.equal(wageArray.length)
    expect(5).to.equal(countItems(wageArray, 600))
    expect(7).to.equal(countItems(wageArray, 400))
    delete occupations[occRecords[2]].data.wageArray
    percentiles = Object.getOwnPropertyNames(data.percentiles)
    expect(7).to.equal(percentiles.length)
    expect('0%').to.equal(percentiles[0])
    expect('10%').to.equal(percentiles[1])
    expect('25%').to.equal(percentiles[2])
    expect('50%').to.equal(percentiles[3])
    expect('75%').to.equal(percentiles[4])
    expect('90%').to.equal(percentiles[5])
    expect('100%').to.equal(percentiles[6])
    expect(400).to.equal(data.percentiles[percentiles[0]])
    expect(400).to.equal(data.percentiles[percentiles[1]])
    expect(400).to.equal(data.percentiles[percentiles[2]])
    expect(400).to.equal(data.percentiles[percentiles[3]])
    expect(600).to.equal(data.percentiles[percentiles[4]])
    expect(600).to.equal(data.percentiles[percentiles[5]])
    expect(600).to.equal(data.percentiles[percentiles[6]])
    delete occupations[occRecords[2]].data.percentiles
    
    expect(_.isEmpty(occupations[occRecords[0]].data)).to.be.true
    delete occupations[occRecords[0]].data
    delete occupations[occRecords[0]]
    delete occupations[occRecords[1]].data
    delete occupations[occRecords[1]]
    delete occupations[occRecords[2]].data
    delete occupations[occRecords[2]]
    expect(_.isEmpty(occupations)).to.be.true
    delete summary['occupations']
    return summary
}

const testLatLngs = (summary) => {
    // Don't validate latLngMap here
    expect(!_.isEmpty(summary['latLngMap'])).to.be.true
    const latLngMap = summary['latLngMap']
    logger.trace(chalk.bgRed(`latLngMap: ${JSON.stringify(latLngMap, undefined, 2)}`))
    var latLngRecords = Object.getOwnPropertyNames(latLngMap)
    logger.trace(chalk.bgRed(`latLngRecords: ${JSON.stringify(latLngRecords, undefined, 2)}`))
    expect(3).to.equal(latLngRecords.length)

    expect("1_3").to.equal(latLngRecords[0])
    var latLngRecord = latLngMap[latLngRecords[0]]
    logger.trace(chalk.bgRed(`latLngRecord: ${JSON.stringify(latLngRecord, undefined, 2)}`))
    expect(latLngRecord.count).to.equal(3)
    expect(latLngRecord.lat).to.equal(1)
    expect(latLngRecord.lng).to.equal(3)
    delete latLngRecord.lat
    delete latLngRecord.lng
    delete latLngRecord.count
    var employerInstanceMap = latLngRecord.instanceMap
    delete latLngRecord.instanceMap
    logger.trace(chalk.bgRed(`latLngRecord: ${JSON.stringify(latLngRecord, undefined, 2)}`))
    expect(_.isEmpty(latLngRecord)).to.be.true
    var instanceMap = Object.getOwnPropertyNames(employerInstanceMap)
    expect(2).to.equal(instanceMap.length)
    expect("TT").to.equal(instanceMap[0])
    logger.trace(chalk.bgRed(`instanceMap[0]: ${JSON.stringify(employerInstanceMap[instanceMap[0]], undefined, 2)}`))
    var count = employerInstanceMap[instanceMap[0]].count
    expect(2).to.equal(count)
    var instanceArray = employerInstanceMap[instanceMap[0]].instanceArray
    var employerName = employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    expect("TT").to.equal(employerName)
    delete employerInstanceMap[instanceMap[0]].count
    delete employerInstanceMap[instanceMap[0]].instanceArray
    delete employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    logger.trace(chalk.bgRed(`instanceMap[0]: ${JSON.stringify(employerInstanceMap[instanceMap[0]], undefined, 2)}`))
    expect(_.isEmpty(employerInstanceMap[instanceMap[0]])).to.be.true
    expect(2).to.equal(instanceArray.length)
    var instance = instanceArray[0]
    expect(!_.isEmpty(instance)).to.be.true
    expect("123").to.equal(instance['SOC_CODE'])
    expect("666").to.equal(instance['CASE_NUMBER'])
    expect("Y").to.equal(instance['H1B_DEPENDENT'])
    expect(17).to.equal(instance['TOTAL_WORKERS'])
    expect(300).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    instanceArray.shift()
    var instance = instanceArray[0]
    expect("abc").to.equal(instance['SOC_CODE'])
    expect("555").to.equal(instance['CASE_NUMBER'])
    expect("R").to.equal(instance['H1B_DEPENDENT'])
    expect(11).to.equal(instance['TOTAL_WORKERS'])
    expect(200).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    expect(!_.isEmpty(instance)).to.be.true
    instanceArray.shift()
    expect(0).to.equal(instanceArray.length)
    delete instanceArray
    instanceMap.shift()
    
    expect(1).to.equal(instanceMap.length)
    expect("TTaddr1addr2").to.equal(instanceMap[0])
    var count = employerInstanceMap[instanceMap[0]].count
    var instanceArray = employerInstanceMap[instanceMap[0]].instanceArray
    var employerName = employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    var addr1 = employerInstanceMap[instanceMap[0]][WORKSITE_ADDR1]
    var addr2 = employerInstanceMap[instanceMap[0]][WORKSITE_ADDR2]
    expect(1).to.equal(count)
    expect("TT").to.equal(employerName)
    expect("addr1").to.equal(addr1)
    expect("addr2").to.equal(addr2)
    delete employerInstanceMap[instanceMap[0]].count
    delete employerInstanceMap[instanceMap[0]].instanceArray
    delete employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    delete employerInstanceMap[instanceMap[0]][WORKSITE_ADDR1]
    delete employerInstanceMap[instanceMap[0]][WORKSITE_ADDR2]
    expect(_.isEmpty(employerInstanceMap[instanceMap[0]])).to.be.true
    expect(1).to.equal(instanceArray.length)
    instance = instanceArray[0]
    expect(!_.isEmpty(instance)).to.be.true
    expect("123").to.equal(instance['SOC_CODE'])
    expect("Y").to.equal(instance['H1B_DEPENDENT'])
    expect("777").to.equal(instance['CASE_NUMBER'])
    expect(23).to.equal(instance['TOTAL_WORKERS'])
    expect(10000).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    delete instance['H1B_DEPENDENT']
    delete instance['CASE_NUMBER']
    delete instance['SOC_CODE']
    delete instance['TOTAL_WORKERS']
    delete instance['ANNUALIZED_WAGE_RATE_OF_PAY']
    expect(_.isEmpty(instance)).to.be.true
    instanceArray.pop()
    expect(0).to.equal(instanceArray.length)
    delete instanceArray
    latLngRecords.shift()

    expect("6_4").to.equal(latLngRecords[0])
    latLngRecord = latLngMap[latLngRecords[0]]
    logger.trace(chalk.bgRed(`latLngRecord: ${JSON.stringify(latLngRecord, undefined, 2)}`))
    expect(latLngRecord.count).to.equal(2)
    expect(latLngRecord.lat).to.equal(6)
    expect(latLngRecord.lng).to.equal(4)
    delete latLngRecord.count
    delete latLngRecord.lat
    delete latLngRecord.lng
    employerInstanceMap = latLngRecord.instanceMap
    delete latLngRecord.instanceMap
    expect(_.isEmpty(latLngRecord)).to.be.true
    logger.trace(chalk.bgRed(`instanceMap: ${JSON.stringify(employerInstanceMap, undefined, 2)}`))
    instanceMap = Object.getOwnPropertyNames(employerInstanceMap)
    expect(1).to.equal(instanceMap.length)
    expect("GG").to.equal(instanceMap[0])
    count = employerInstanceMap[instanceMap[0]].count
    instanceArray = employerInstanceMap[instanceMap[0]].instanceArray
    employerName = employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    expect(2).to.equal(count)
    expect("GG").to.equal(employerName)
    delete employerInstanceMap[instanceMap[0]].count
    delete employerInstanceMap[instanceMap[0]].instanceArray
    delete employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    expect(_.isEmpty(employerInstanceMap[instanceMap[0]])).to.be.true
    expect(2).to.equal(instanceArray.length)
    instance = instanceArray[0]
    expect(!_.isEmpty(instance)).to.be.true
    expect(!_.isEmpty(instance)).to.be.true
    expect("444").to.equal(instance['CASE_NUMBER'])
    expect("Y").to.equal(instance['H1B_DEPENDENT'])
    expect("xyz").to.equal(instance['SOC_CODE'])
    expect(7).to.equal(instance['TOTAL_WORKERS'])
    expect(400).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    delete instance['CASE_NUMBER']
    delete instance['H1B_DEPENDENT']
    delete instance['SOC_CODE']
    delete instance['TOTAL_WORKERS']
    delete instance['ANNUALIZED_WAGE_RATE_OF_PAY']
    expect(_.isEmpty(instance)).to.be.true
    instanceArray.shift()
    instance = instanceArray[0]
    expect("111").to.equal(instance['CASE_NUMBER'])
    expect("Y").to.equal(instance['H1B_DEPENDENT'])
    expect("xyz").to.equal(instance['SOC_CODE'])
    expect(5).to.equal(instance['TOTAL_WORKERS'])
    expect(600).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    delete instance['CASE_NUMBER']
    delete instance['H1B_DEPENDENT']
    delete instance['SOC_CODE']
    delete instance['TOTAL_WORKERS']
    delete instance['ANNUALIZED_WAGE_RATE_OF_PAY']
    expect(_.isEmpty(instance)).to.be.true
    instanceArray.pop()
    instanceArray.pop()
    expect(0).to.equal(instanceArray.length)
    delete instanceArray
    latLngRecords.shift()
    
    expect("5_8").to.equal(latLngRecords[0])
    var latLngRecord = latLngMap[latLngRecords[0]]
    logger.trace(chalk.bgRed(`latLngRecord: ${JSON.stringify(latLngRecord, undefined, 2)}`))
    expect(latLngRecord.count).to.equal(1)
    expect(latLngRecord.lat).to.equal(5)
    expect(latLngRecord.lng).to.equal(8)
    delete latLngRecord.count
    delete latLngRecord.lat
    delete latLngRecord.lng
    var employerInstanceMap = latLngRecord.instanceMap
    delete latLngRecord.instanceMap
    expect(_.isEmpty(latLngRecord)).to.be.true
    logger.trace(chalk.bgRed(`employerInstanceMap: ${JSON.stringify(employerInstanceMap, undefined, 2)}`))
    var instanceMap = Object.getOwnPropertyNames(employerInstanceMap)
    expect(1).to.equal(instanceMap.length)
    expect("AA").to.equal(instanceMap[0])
    var count = employerInstanceMap[instanceMap[0]].count
    var instanceArray = employerInstanceMap[instanceMap[0]].instanceArray
    employerName = employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    expect(1).to.equal(count)
    expect("AA").to.equal(employerName)
    delete employerInstanceMap[instanceMap[0]].count
    delete employerInstanceMap[instanceMap[0]].instanceArray
    delete employerInstanceMap[instanceMap[0]][EMPLOYER_NAME]
    expect(_.isEmpty(employerInstanceMap[instanceMap[0]])).to.be.true
    expect(1).to.equal(instanceArray.length)
    instance = instanceArray[0]
    expect(!_.isEmpty(instance)).to.be.true
    expect("C").to.equal(instance['H1B_DEPENDENT'])
    expect("333").to.equal(instance['CASE_NUMBER'])
    expect("123").to.equal(instance['SOC_CODE'])
    expect(2).to.equal(instance['TOTAL_WORKERS'])
    expect(150).to.equal(instance['ANNUALIZED_WAGE_RATE_OF_PAY'])
    delete instance['H1B_DEPENDENT']
    delete instance['CASE_NUMBER']
    delete instance['SOC_CODE']
    delete instance['TOTAL_WORKERS']
    delete instance['ANNUALIZED_WAGE_RATE_OF_PAY']
    expect(_.isEmpty(instance)).to.be.true
    instanceArray.pop()
    expect(0).to.equal(instanceArray.length)
    delete instanceArray
    latLngRecords.shift()

    expect(_.isEmpty(latLngRecords)).to.be.true

    logger.trace(chalk.bgRed(`latLngRecord: ${JSON.stringify(latLngRecord, undefined, 2)}`))
    delete summary['latLngMap']
    logger.trace(`${JSON.stringify(summary)}`)
}

const reOrderArray = (array) => {
    const copyArray = _.clone(array)
    const newArray = []

    while(copyArray.length > 0){
        const index = Math.random() * copyArray.length
        const arr = copyArray.splice(index, 1)
        newArray.push(arr[0])
    }
    return newArray
}
