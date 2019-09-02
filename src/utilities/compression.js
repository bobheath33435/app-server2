const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')
const pako = require("pako")

const log = console.log
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});

const compress = (uncompressedData) => {
    return pako.deflate(JSON.stringify(uncompressedData), { to: 'string' })
}

const decompress = (compressedData) => {
    return JSON.parse(pako.inflate(compressedData, { to: 'string' }))
}

module.exports = { compress, decompress  }