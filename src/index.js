const mongoose = require('mongoose')
const express = require('express')
const app = express()
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log;
const h1bRecordRouter =  require('./routers/h1bRecordRouter')

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

app.post('/h1b', (req, res) => {
    logger.info('Processing post');
    log(chalk.bgRed.white(JSON.stringify(req.body)))
    const year = req.body.YEAR;
    console.log('Year: ' + year)
 
    const h1bRecord = new modelMap[year](req.body)
    h1bRecord.save().then(() => {
        logger.info('H1bRecord: ' + h1bRecord)
        res.send(h1bRecord)
    }).catch((error) => {
        res.send(error)
    })
})

app.listen(port, () => {
    log(chalk.bgRed.white.bold('Server is up on port') + chalk.red.bold(' ' + port))
})

