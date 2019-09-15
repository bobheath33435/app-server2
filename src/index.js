const moment = require('moment')
const log4js = require('log4js')
const chalk = require('chalk')
const log = console.log

const { app, logger } = require('./app')
const port = 3000


app.listen(port, () => {
    logger.info(chalk.bgRed.white.bold('Server is up on port') + ' ' + chalk.green.bold(port))
})

