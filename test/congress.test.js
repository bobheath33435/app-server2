const log4js = require('log4js')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const log = console.log;
const logger = log4js.getLogger('h1bData');
const chalk = require('chalk')
const { modelMap } = require('../src/models/dbRecords')

const expect = require('chai').expect
const _ = require('lodash')
const { compress, decompress } = require('../src/utilities/compression')

describe('Sanity check of congressional data', () => {
    beforeEach(() => {
    })
    
    logger.trace('Sanity check of congressional data');
    it('1) read congressional data and check a few random properties', async () => {
        const congressModel = modelMap['congress']
        expect(!_.isEmpty(congressModel)).to.be.true
        var congress = await congressModel.find({"key": "congress"})
        congress = congress[0].congress
        congress = decompress(congress)
        expect(!_.isEmpty(congress)).to.be.true
        expect("Tim Scott").to.equal(congress['SC-B']['full_name'])
        expect("202-224-5141").to.equal(congress['VT-B']['phone'])
        expect("Rick").to.equal(congress['AR-1']['nickname'])
        expect("Paul A. Gosar").to.equal(congress['AZ-4']['full_name'])
        expect("Westerman").to.equal(congress['AR-4']['last_name'])
        logger.trace(`congress - ${JSON.stringify(congress, undefined, 2)}`)
    })
})   
        