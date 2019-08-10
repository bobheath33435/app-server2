const mongoose = require('mongoose')
const express = require('express')
const app = express()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const h1bRecordRouter =  require('./routers/h1bRecordRouter')
const usersRouter =  require('./routers/usersRouter')

log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('./models/dbRecords')
const logger = log4js.getLogger('h1bData');
const port = 3000
logger.info('Initialize');

app.use(express.json())
app.use(h1bRecordRouter)
app.use(usersRouter)

app.listen(port, () => {
    log(chalk.bgRed.white.bold('Server is up on port') + ' ' + chalk.green.bold(port))
})

