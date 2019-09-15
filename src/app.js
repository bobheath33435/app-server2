const mongoose = require('mongoose')
const express = require('express')
const si = require('systeminformation')
const moment = require('moment')
const app = express()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log
const logger = log4js.getLogger('h1bData');
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))

    const { readSummarizedQueries } = require('./utilities/summarize')
    const { h1bRecordRouter } = require('./routers/h1bRecordRouter')
    const usersRouter = require('./routers/usersRouter')
    const congressRouter = require('./routers/congressRouter')
    const autocompleteRouter = require('./routers/autoCompDataRouter')
    
    const modelMap = require('./models/dbRecords')
    const beginTime = moment()
    logger.info(chalk.bgRed.white.bold(`Initialize: ${beginTime.format('MMMM Do YYYY, h:mm:ss a')}`));
    
    readSummarizedQueries()
    
    app.use(express.json())
    app.use(h1bRecordRouter)
    app.use(usersRouter)
    app.use(congressRouter)
    app.use(autocompleteRouter)

}
si.osInfo(cb)

module.exports = { app, logger }
