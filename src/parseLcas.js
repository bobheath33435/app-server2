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
const { parseFile, sortEmployerName, sortWorksiteCity, sortWorksiteAddr1}
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
        // years.forEach(async(year) => {
        //     const filename = config.lcaFileTemplate.replace(/<year>/, year)
        //     logger.info(chalk.bgBlue.white.bold(`LCA file name: ${filename}`))
        //     autoCompleteMap = await parseFile(filename, autoCompleteMap)    
        // })
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
            var worksiteCitiesArray = Object.values(autoCompleteMap.worksiteCities)
            autoCompleteMap.worksiteCitiesArray = worksiteCitiesArray
                        .sort((a, b) => sortWorksiteCity(a, b))
            delete autoCompleteMap.worksiteCities

            logger.trace(JSON.stringify(autoCompleteMap, undefined, 2))
            var autoCompleteRecord = {
                "key": 'autocomplete',
                "autocomplete": compress(autoCompleteMap)
            }
            const autocompleteModel = modelMap['autocomplete']
            const autocomplete = autocompleteModel(autoCompleteRecord)
            logger.info(chalk.bgBlue('Save autoComplete started'))
            await autocomplete.save()
            logger.info(chalk.bgBlue('Save autoComplete complete'))    
            logger.trace(chalk.bgBlue(`cities: ${JSON.stringify(autoCompleteMap, undefined, 2)}`)) 
        }catch(e){
            logger.error(chalk.bgRed.white.bold("Saving autocomplete data failed: " + e))
            logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        }
    
}

si.osInfo(cb)

