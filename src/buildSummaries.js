const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const si = require('systeminformation')
const moment = require('moment')
const _ = require('lodash')

const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('./models/h1bRecordSchema')
const log = console.log;
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

const { states } = require('./models/states')
const { employerNames } = require('./models/employerNames')
const { asyncForEach, asyncForLoop } = require('./utilities/asyncRoutines')

const { modelMap } = require('./models/dbRecords')
const { SummarySaveModel } = require('./models/summarySchema')
const { summarizeAndCompress, createKey, years,
            compressSummaryRecord, decompressSummaryRecord } = require('./utilities/summarize')
const { initYearObject, mergeStateObjects, finalizeMerge} = require('./utilities/yearModules')

const processState = ( async(year, stateRecord) => {
    const worksiteState = stateRecord.id
    const congDistCount = stateRecord.congressionalDistricts
    const counties = stateRecord.counties
    const cities = stateRecord.cities
    var h1bObject = {}
    try{
        logger.info(chalk.bgHex("#0aee0a").black("Process State Year: " + year + " - State: " + worksiteState))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = worksiteState
        h1bObject = await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
        await processCongDistricts(year, worksiteState, congDistCount)
        if(!_.isEmpty(counties)){
            await processCounties(year, worksiteState, counties)
        }   
        if(!_.isEmpty(cities)){
            await processCities(year, worksiteState, cities)
        }   
    }catch(e){
        logger.error(chalk.bgRed(`Process State, ${worksiteState}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve(h1bObject)
})

const queryDB = async (query) => {
    const h1bModel = modelMap[query.YEAR]
    logger.trace(chalk.bgBlue('query: ' + JSON.stringify(query)))
    const key = createKey(query)
    logger.trace(chalk.bgBlue("Key: " + key + ' -- query: ' + JSON.stringify(query)))

    logger.trace(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
    const h1bRecords = await h1bModel.find(query)
    logger.trace(chalk.bgBlue('Read data complete'))
    return Promise.resolve(h1bRecords) 
}

const saveSummary = async(key, h1bObject) => {
    logger.trace(chalk.bgBlue('Data summarized'))
    logger.trace(JSON.stringify(h1bObject, undefined, 2))
    var summaryRecord = {
        "key": key,
        "summary": h1bObject
    }
    logger.trace(chalk.bgBlue('Save summary started'))
    const h1bSummary = SummarySaveModel(summaryRecord)
    logger.trace(chalk.bgBlue('Save summary start'))
    await h1bSummary.save()
    logger.trace(chalk.bgBlue('Save summary complete'))
}

const queryAndSave = async (query) => {
    const h1bRecords = await queryDB(query)
    logger.trace(chalk.bgHex("#ca4e0a").white.bold("query count: " + h1bRecords.length))
    h1bObject = summarizeAndCompress(h1bRecords, query)
    await saveSummary(createKey(query), h1bObject)
    return Promise.resolve(h1bObject)
}

const processCounty = ( async(year, state, county) => {
    try{
        county = county.toUpperCase()
        logger.info(chalk.bgHex("#ca4e0a").white.bold("Process County Year: " + year + " - State: " + state + " - County: " + county))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_COUNTY] = county
        await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process County, ${county} County, ${state}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processCity = ( async(year, state, city) => {
    try{
        city = city.toUpperCase()
        logger.info(chalk.bgHex("#0a9999").white.bold("Process City Year: " + year + " - State: " + state + " - City: " + city))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_CITY] = city
        await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process City, ${city}, ${state}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processCongDistrict = ( async(year, state, index) => {
    try{
        logger.info(chalk.bgHex("#1133aa").white.bold("Process Congress District Year: " + year + " - State: " + state +
                         " - Congressional District: " + index))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_CONGRESS_DISTRICT] = index
        await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process Congressional District, ${index}, ${state}, failed: ` + e))
        logger.error(`Stack: ` + e.stack)
        throw(e)
    }
    return Promise.resolve
})

const processEmployer = ( async(year, employer, index) => {
    try{
        logger.info(chalk.bgHex("#11aa33").white.bold("Process Employer Year: " + year + " - Employer: " + employer))
        const query = {}
        query[YEAR] = year
        query[EMPLOYER_NAME] = employer
        await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process Employer, ${index}, ${employer}, failed: ` + e))
        logger.error(`Stack: ` + e.stack)
        throw(e)
    }
    return Promise.resolve
})

const processStates = async (year) => {
    try{
        var yearH1bObject = initYearObject(year)
        await asyncForEach(states, async(stateRecord) => {
           try{
                var stateH1bObject = {}
                stateH1bObject = await processState(year, stateRecord)
                stateH1bObject = decompressSummaryRecord(stateH1bObject)
                mergeStateObjects(yearH1bObject, stateH1bObject)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${stateRecord.id} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other states.'))
            }
        })

        const query = {"YEAR": year}
        yearH1bObject = finalizeMerge(yearH1bObject)
        await saveSummary(createKey(query), compressSummaryRecord(yearH1bObject))
        logger.info(chalk.bgHex("#5511aa").white.bold("Save Year Record: " + year))
    }catch(e){
        logger.error(chalk.bgRed('Process States FAILED. ' + e))
        logger.error(`Stack: ` + e.stack)
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processEmployers = async (year) => {
    try{
        await asyncForEach(employerNames, async(employerName) => {
           try{
                const employerObject = await processEmployer(year, employerName)
           }catch(e){
                logger.error(chalk.bgRed(`Processing ${employerName} failed: ` + e))
                logger.error(`Stack: ` + e.stack)
                logger.error(chalk.bgRed('Continuning to other employers.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed('Process States FAILED. ' + e))
        logger.error(`Stack: ` + e.stack)
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processCounties = async (year, state, counties) => {
    try{
        await asyncForEach(counties, async(county) => {
           try{
                await processCounty(year, state, county)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${county} County, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other counties.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Counties FAILED.`))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processCities = async (year, state, cities) => {
    try{
        await asyncForEach(cities, async(city) => {
           try{
                await processCity(year, state, city)
            }catch(e){
                logger.error(chalk.bgRed(`Processing the city ${city}, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other cities.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Cities FAILED.`))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processCongDistricts = async (year, state, congDistCount) => {
    try{
        await asyncForLoop(congDistCount, async(index) => {
           try{
                const congDistrict = index + 1
                await processCongDistrict(year, state, congDistrict)
            }catch(e){
                logger.error(chalk.bgRed(`Processing Congressional District ${congDistrict}, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other counties.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Counties FAILED.`))
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processYears = async () => {
    const beginTime = moment()
    logger.info(chalk.bgRed.white.bold(`Initialize: ${beginTime.format('MMMM Do YYYY, h:mm:ss A')}`));
    try{
        await asyncForEach(years, async(year) => {
            logger.info("Process Year: " + year)
            currentYear = year
            try{
                await processEmployers(year)
                await processStates(year)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${year} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other years.'))
            }
            const timeUnits = 'hours'
            var duration = moment().diff(beginTime, timeUnits, true)
            logger.info(chalk.bgHex('#880066').white.bold(`Elapsed Time: ${duration.toFixed(2)} ${timeUnits}`))               
        })
    }catch(e){
        logger.error(chalk.bgRed('Process Years FAILED: ' + e))
        logger.error(chalk.bgRed.white.bold(`Stack: ${e.stack}`))
        // return Promise.reject(e)
    }
    logger.info(chalk.bgBlue('End of building summaries'))
    return Promise.resolve
}

const bldSummaries = async () => {
    logger.info('Build summaries');
    // start()
    await processYears()

    setTimeout( () => {
        log("Timer expired")
    }, 0)
    logger.info(chalk.bgRed.bold("Build complete"))
    process.exit()
}

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))

    bldSummaries()
}
si.osInfo(cb)

module.exports = { initYearObject, mergeStateObjects, finalizeMerge }