const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('./config')
const modelMap = require('./models/dbRecords')
const { compress, decompress } = require('./utilities/compression')
const { years } = require('./utilities/summarize')
const { parseFile, sortEmployerName, sortWorksiteCity, sortWorksiteCounty, sortWorksiteAddr1}
                = require('./utilities/lcaParser')

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
        // logger.info(`System Info: ${JSON.stringify(obj)}`)
        logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
        logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
        configSystem(obj.platform)
        var autoCompleteMap = {
            worksiteCities: {},
            worksiteCounties: {},
            employers: {},
            worksiteAddr1s: {},
            worksiteAddr2s: {},
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
            autoCompleteMap.worksiteCitiesArray
                    = migrateToArray(autoCompleteMap.worksiteCities, sortWorksiteCity)
            delete autoCompleteMap.worksiteCities
            autoCompleteMap.worksiteCountiesArray
                    = migrateToArray(autoCompleteMap.worksiteCounties, sortWorksiteCity)
            delete autoCompleteMap.worksiteCounties
            autoCompleteMap.employerNamesArray
                    = migrateToArray(autoCompleteMap.employers, sortEmployerName)
            delete autoCompleteMap.employers
            logger.info(chalk.bgBlue('Save autoComplete started'))
            await saveToDb('autocomplete', compress(autoCompleteMap))
            // await saveToDb('autocomplete.cities', compress(autoCompleteMap.worksiteCitiesArray))
            // await saveToDb('autocomplete.counties', compress(autoCompleteMap.worksiteCountiesArray))
            // await saveToDb('autocomplete.employers', compress(autoCompleteMap.employerNamesArray))
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
    const autocompleteModel = modelMap['autocomplete']
    const autocompleteSummary = autocompleteModel(autoCompleteRecord)
    await autocompleteSummary.save()
    logger.trace(chalk.bgBlue(`value: ${JSON.stringify(value, undefined, 2)}`)) 
}

const migrateToArray = (map, sort) => {
    var array = Object.values(map)
    array = array.sort((a, b) => sort(a, b))
    map = undefined
    return array
}

si.osInfo(cb)

