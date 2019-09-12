const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('./config')
const modelMap = require('./models/dbRecords')
const { compress, decompress } = require('./utilities/compression')
const { parseFile} = require('./utilities/lcaParser')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

var results = {}

const cb = async(obj) => {
    try{
        // logger.info(`System Info: ${JSON.stringify(obj)}`)
        logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
        logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
        configSystem(obj.platform)
        const year = 2017
        const filename = config.lcaFileTemplate.replace(/<year>/, year)
        logger.info(chalk.bgBlue.white.bold(`LCA file name: ${filename}`))

        var autoCompleteMap = {
            cities: {},
            counties: {},
            employers: {},
            worksiteAddr1s: {},
            worksiteAddr2s: {},
        }
        autoCompleteMap = await parseFile(filename, autoCompleteMap)
        await saveLcas(autoCompleteMap)
        logger.info("The End")
        // process.exit()
    }catch(e){
        logger.error(chalk.bgRed.white.bold("lcaParse failed: " + e))
        logger.error(chalk.bgRed.white.bold("stack: " + e.stack))
    }
 }

const saveLcas = async(autoCompleteMap) => {
    return new Promise((resolve, reject) => {
        try{
            const cities = autoCompleteMap.cities
            logger.trace(JSON.stringify(cities, undefined, 2))
            // var congressRecord = {
            //     "key": 'congress',
            //     "congress": compress(congress)
            // }
            // const congressModel = modelMap['congress']
            // const congressSummary = congressModel(congressRecord)
            // logger.info(chalk.bgBlue('Save congress started'))
            // await congressSummary.save()
            // logger.info(chalk.bgBlue('Save congress complete'))    
            logger.info(chalk.bgBlue(`cities: ${JSON.stringify(cities, undefined, 2)}`)) 
            return resolve() 
        }catch(e){
            logger.error(chalk.bgRed.white.bold("Saving autocomplete data failed: " + e))
            logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
            return reject()
        }
    
    })
}

si.osInfo(cb)

