const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const { mongoConnect } = require('./utilities/dbConnect');

const {configSystem, config, platform, congressFilename} = require('./config')
const { AutocompleteModel } = require('./models/autocompleteSchema')
const { compress, decompress } = require('./utilities/compression')
const { years } = require('./utilities/summarize')
const { parseFile, sortEmployerName, sortEmployerAddress, sortEmployerCity,
                sortEmployerState, sortWorksiteAddr1, sortWorksiteAddr2, sortWorksiteCity,
                sortWorksiteCounty, sortWorksiteState, sortJobTitle, sortSocCode,
                sortWageLevel }
            = require('./utilities/lcaParser')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, EMPLOYER_ADDRESS,
    EMPLOYER_CITY, EMPLOYER_STATE, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    JOB_TITLE, LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('./models/h1bRecordSchema')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

var results = {}

const asyncForEach = (async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
})


const cb = async(obj) => {
    try{
        await mongoConnect()
        // logger.info(`System Info: ${JSON.stringify(obj)}`)
        logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
        logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
        configSystem(obj.platform)
        var autoCompleteMap = {
            worksiteCities: {},
            worksiteCounties: {},
            worksiteStates: {},
            worksiteAddr1s: {},
            worksiteAddr2s: {},
            employers: {},
            employerAddresses: {},
            employerCities: {},
            employerStates: {},
            jobTitles: {},
            socCodes: {},
            wageLevels: {}
        }
        const year = 2017
        await asyncForEach(years, async(year) => {
            const filename = config.lcaFileTemplate.replace(/<year>/, year)
            logger.info(chalk.bgBlue.white.bold(`LCA file name: ${filename}`))
            autoCompleteMap = await parseFile(filename, autoCompleteMap)    
        })
        await saveAutocompleteData(autoCompleteMap)
        logger.info("The End")
        // process.exit()
    }catch(e){
        logger.error(chalk.bgRed.white.bold("lcaParse failed: " + e))
        logger.error(chalk.bgRed.white.bold("stack: " + e.stack))
    }
 }

const saveAutocompleteData = async(autoCompleteMap) => {

    try{
        logger.info(chalk.bgBlue('Save autoComplete started'))
        const wageLevelArray
                = migrateToArray(autoCompleteMap.wageLevels, sortWageLevel)
        delete autoCompleteMap.wageLevels
        await saveToDb(WAGE_LEVEL, compress(wageLevelArray))

        const socCodesArray
                = migrateToArray(autoCompleteMap.socCodes, sortSocCode)
        delete autoCompleteMap.socCodes
        await saveToDb(SOC_CODE, compress(socCodesArray))

        const jobTitlesArray
                = migrateToArray(autoCompleteMap.jobTitles, sortJobTitle)
        delete autoCompleteMap.jobTitles
        await saveToDb(JOB_TITLE, compress(jobTitlesArray))

        const worksiteAddr1s
                = migrateToArray(autoCompleteMap.worksiteAddr1s, sortWorksiteAddr1)
        delete autoCompleteMap.worksiteAddr1s
        await saveToDb(WORKSITE_ADDR1, compress(worksiteAddr1s))

        const worksiteAddr2s
                = migrateToArray(autoCompleteMap.worksiteAddr2s, sortWorksiteAddr2)
        delete autoCompleteMap.worksiteAddr2s
        await saveToDb(WORKSITE_ADDR2, compress(worksiteAddr2s))

        const worksiteCitiesArray
                = migrateToArray(autoCompleteMap.worksiteCities, sortWorksiteCity)
        delete autoCompleteMap.worksiteCities
        await saveToDb(WORKSITE_CITY, compress(worksiteCitiesArray))

        const worksiteCountiesArray
                = migrateToArray(autoCompleteMap.worksiteCounties, sortWorksiteCounty)
        delete autoCompleteMap.worksiteCounties
        await saveToDb(WORKSITE_COUNTY, compress(worksiteCountiesArray))

        const worksiteStatesArray
                = migrateToArray(autoCompleteMap.worksiteStates, sortWorksiteState)
        delete autoCompleteMap.worksiteStates
        await saveToDb(WORKSITE_STATE, compress(worksiteStatesArray))

        const employerNamesArray
                = migrateToArray(autoCompleteMap.employers, sortEmployerName)
        delete autoCompleteMap.employers
        await saveToDb(EMPLOYER_NAME, compress(employerNamesArray))

        const employerAddressesArray
                = migrateToArray(autoCompleteMap.employerAddresses, sortEmployerAddress)
        delete autoCompleteMap.employerAddresses
        await saveToDb(EMPLOYER_ADDRESS, compress(employerAddressesArray))

        const employerCitiesArray
                = migrateToArray(autoCompleteMap.employerCities, sortEmployerCity)
        delete autoCompleteMap.employerCities
        await saveToDb(EMPLOYER_CITY, compress(employerCitiesArray))

        const employerStatesArray
                = migrateToArray(autoCompleteMap.employerStates, sortEmployerState)
        delete autoCompleteMap.employerStates
        await saveToDb(EMPLOYER_STATE, compress(employerStatesArray))

        logger.info(chalk.bgBlue('Save autoComplete complete'))    
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Saving autocomplete data failed: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
    }
}

const saveToDb = async (key, value) => {
    debugger
    var autoCompleteRecord = {
        "key": key,
        "autocomplete": value
    }
    const newAutocomplete = new AutocompleteModel(autoCompleteRecord)
    logger.info(chalk.bgGreen.white.bold(`${key} dataset being saved`))
    await newAutocomplete.save()
    logger.trace(chalk.bgBlue(`value: ${JSON.stringify(value, undefined, 2)}`)) 
}

const migrateToArray = (map, sort) => {
    var array = Object.values(map)
    array = array.sort((a, b) => sort(a, b))
    map = undefined
    return array
}

si.osInfo(cb)

