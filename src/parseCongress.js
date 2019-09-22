const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('./config')
const { modelMap, congressKey } = require('./models/dbRecords')
const { compress, decompress } = require('./utilities/compression')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');

var results = {}

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
    configSystem(obj.platform)
    logger.info(chalk.bgBlue.white.bold(`Congress file name: ${config.congressFilename}`))

    fs.createReadStream(config.congressFilename)
        .pipe(csv())
        .on('error', (err) => logger.error(`ERROR - ${err}`))
        .on('data', (chunk) => {
            const key = chunk.state + '-' + chunk.district
            results[key] = chunk
            // logger.info(chalk.bgBlue.white.bold(`${JSON.stringify(chunk, undefined, 2)}`))
        })
        .on('end', () => {
            saveCongress(results)
        })
}

const saveCongress = async(congress) => {
    try{
        logger.trace(JSON.stringify(congress, undefined, 2))
        var congressRecord = {
            "key": 'congress',
            "congress": compress(congress)
        }
        const congressModel = modelMap[congressKey]
        const congressSummary = congressModel(congressRecord)
        logger.info(chalk.bgBlue('Save congress started'))
        await congressSummary.save()
        logger.info(chalk.bgBlue('Save congress complete'))    
    }catch(e){
        logger.error(chalk.bgRed.white.bold("Saving congress data failed: " + e))
        logger.error(chalk.bgRed.white.bold("Stack: " + e.stack))
        
    }
}


si.osInfo(cb)

