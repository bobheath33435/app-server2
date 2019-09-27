const log4js = require('log4js')
const request = require('supertest')
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const log = console.log;
const logger = log4js.getLogger('h1bData');
const chalk = require('chalk')
const { CongressModel } = require('../src/models/congressSchema')

const { app } = require('../src/app')
const expect = require('chai').expect
const sinon = require('sinon')
const _ = require('lodash')
const { compress, decompress } = require('../src/utilities/compression')

describe('Sanity check of congressional data', () => {
    beforeEach(() => {
    })
    
    logger.trace('Sanity check of congressional data');
    it('1) read congressional data with the model', async () => {
        expect(_.isEmpty(CongressModel)).to.be.false
        var congress = await CongressModel.find({"key": "congress"})
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
    it('2) read congressional data with api', async () => {
        var query = {}
        query['key'] = "congress"
        var congress = await request(app).get('/congress').send(query).expect(200)
        congress = congress.body
        var keys = Object.getOwnPropertyNames(congress)
        logger.trace(`keys - ${JSON.stringify(keys, undefined, 2)}`)
        logger.trace(`congress - ${JSON.stringify(congress, undefined, 2)}`)
        expect(!_.isEmpty(congress)).to.be.true
        expect("F").to.equal(congress['DC-1']['gender'])
        expect("Lisa").to.equal(congress['DE-1']['first_name'])
        expect("Voted For").to.equal(congress['FL-1']['S386_HR1044'])
        expect("Slotkin").to.equal(congress['MI-8']['last_name'])
        expect(11).to.equal(Number(congress['OH-11']['district']))
    })
})   
        