const si = require('systeminformation')
const moment = require('moment')
const log4js = require('log4js')
const chalk = require('chalk')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const logger = log4js.getLogger('h1bData');
const log = console.log

var platform
var config = {}

const configSystem = (plat) => {
    platform = plat
    if("win32" == platform){
        config.congressFilename = "G:\\MembersOfCongress\\MembersOfCongress.csv"
        config.lcaFileTemplate = "G:\\ReducedH1bData\\base\\h1b-2017.out.latlng.csv"
    }else{
        logger.error(chalk.bgRed.white.bold("Platform is not configured."))
    }
}

module.exports = { configSystem, platform, config }