const csv= require('csv-parser')
const fs = require('fs')
const si = require('systeminformation')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const {configSystem, config, platform, congressFilename} = require('./config')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');



var results = []

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
    configSystem(obj.platform)
    logger.info(chalk.bgBlue.white.bold(`Congress file name: ${config.congressFilename}`))

    fs.createReadStream(config.congressFilename)
        .pipe(csv())
        .on('error', (err) => logger.error(`ERROR - ${err}`))
        .on('data', (chunk) => results.push(chunk))
        .on('end', () => {
            console.log(results)
        })
}
si.osInfo(cb)

