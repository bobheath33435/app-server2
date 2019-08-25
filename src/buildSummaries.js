const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const { CASE_NUMBER, YEAR, WAGE_LEVEL, EMPLOYER_NAME, WORKSITE_CONGRESS_DISTRICT,
    WORKSITE_LATITUDE, WORKSITE_LONGITUDE, WORKSITE_ADDR1, WORKSITE_ADDR2,
    WORKSITE_CITY, WORKSITE_COUNTY, WORKSITE_STATE, TOTAL_WORKERS, TOTAL_LCAS, SOC_CODE, 
    LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4,
    NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT, CHANGE_PREVIOUS_EMPLOYMENT,
    NEW_CONCURRENT_EMPLOYMENT, CHANGE_EMPLOYER, AMENDED_PETITION,
    UNSPECIFIED, ANNUALIZED_PREVAILING_WAGE, ANNUALIZED_WAGE_RATE_OF_PAY,
    salaryLevels, h1bRecord } 
        = require('./models/h1bRecordSchema')
const log = console.log;
const alaskaCounties = ["Aleutians East", "Aleutians West", "Anchorage", "Bethel", "Bristol Bay", "Denali", 
                            "Dillingham", "Fairbanks North Star", 
                            "Haines", "Juneau",  
                            "Kenai Peninsula", "Kodiak Island", "Lake and Peninsula", "Nome", "North SLope", 
                            "Northwest Arctic", "Sitka", "Yakutat", "Wade Hampton"]
const alabamaCounties = ["Autauga", "Baldwin", "Barbour", "Bibb", "Blount", 
                            "Bullock", "Butler", "Calhoun", "Chambers",
                            "Cherokee", "Chilton", "Choctaw", "Clarke", "Clay", "Cleburne",
                            "Coffee", "Colbert", "Conecuh", "Coosa", "Covington", "Crenshaw",
                            "Cullman", "Dale", "Dallas", "DeKalb", "Elmore", "Escambia",
                            "Etowah", "Fayette", "Franklin", "Geneva", "Greene", "Hale",
                            "Henry", "Houston", "Jackson", "Jefferson", "Lamar", "Lauderdale",
                            "Lawrence", "Lee", "Limestone", "Lowndes", "Macon", "Madison",
                            "Marengo", "Marion", "Marshall", "Mobile", "Monroe", "Montgomery",
                            "Morgan", "Perry", "Pickens", "Pike", "Randolph", "Russell",
                            "St. Clair", "Shelby", "Sumter", "Talladega", "Tallapoosa",
                            "Tuscaloosa", "Walker", "Washington", "Wilcox", "Winston"
                        ]
const californiaCounties = [
    "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa",
    "Del Norte", "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo",
    "Kern", "Kings", "Lake", "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa",
    "Mendocino", "Merced", "Modoc", "Mono", "Monterey", "Napa", "Nevada", "Orange", 
    "Placer", "Plumas", "Riverside", "Sacramento", "San Benito", "San Bernardino",
    "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo", "San Mateo", 
    "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
    "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne",
    "Ventura", "Yolo", "Yuba"
]
const newJerseyCounties = [ 
    "Atlantic", "Bergen", "Burlington", "Camden", "Cape May",
    "Cumberland", "Essex", "Gloucester", "Hudson", "Hunterdon", "Mercer", "Middlesex",
    "Monmouth", "Morris", "Ocean", "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren"
]
const newYorkCounties = [ 
    "Albany", "Allegany", "Bronx", "Broome", "Cattaraugus", "Cayuga",
    "Chautauqua", "Chemung", "Chenango", "Clinton", "Columbia", "Cortland", "Delaware",
    "Dutchess", "Erie", "Essex", "Franklin", "Fulton", "Genesee", "Greene", "Hamilton",
    "Herkimer", "Jefferson", "Kings", "Lewis", "Livingston", "Madison", "Monroe",
    "Montgomery", "Nassau", "New York", "Niagara", "Oneida", "Onondaga", "Ontario",
    "Orange", "Orleans", "Oswego", "Otsego", "Putnam", "Queens", "Rensselaer", "Richmond",
    "Rockland", "St. Lawrence", "Saratoga", "Schenectady", "Schoharie", "Schuyler", "Seneca",
    "Steuben", "Suffolk", "Sullivan", "Tioga", "Tompkins", "Ulster", "Warren", "Washington",
    "Wayne", "Westchester", "Wyoming", "Yates"
]
const northCarolinaCounties = [
    "Alamance", "Alexander", "Alleghany", "Anson", "Ashe", "Avery", "Beaufort", "Bertie",
    "Bladen", "Brunswick", "Buncombe", "Burke", "Cabarrus", "Caldwell", "Camden", "Carteret",
    "Caswell", "Catawba", "Chatham", "Cherokee", "Chowan", "Clay", "Cleveland", "Columbus",
    "Craven", "Cumberland", "Currituck", "Dare", "Davidson", "Davie", "Durham", "Edgecombe",
    "Forsyth", "Franklin", "Gaston", "Gates", "Graham", "Granville", "Greene", "Guilford",
    "Halifax", "Harnett", "Haywood", "Henderson", "Hertford", "Hoke", "Hyde", "Iredell",
    "Jackson", "Johnston", "Jones", "Lee", "Lenoir", "Lincoln", "McDowell",
    "Macon", "Madison", "Martin", "Mecklenburg", "Mitchell", "Montgomery", 
    "Moore", "Nash", "New Hanover", "Northampton", "Onslow", "Orange", "Pamlico",
    "Pasquotank", "Pender", "Perquimans", "Person", "Pitt", "Polk", "Randolph",
    "Richmond", "Robeson", "Rockingham", "Rowan", "Rutherford ", "Sampson",
    "Scotland", "Stanly", "Stokes", "Surry", "Swain", "Transylvania", "Tyrrell",
    "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne", "Wilkes",
    "Wilson", "Yadkin", "Yancey"
]
const texasCounties = [
    "Anderson", "Andrews", "Angelina", "Aransas", "Archer", "Armstrong", "Atascosa",
    "Austin", "Bailey", "Bandera", "Bastrop", "Baylor", "Bee", "Bell", "Bexar", "Blanco",
    "Borden", "Bosque", "Bowie", "Brazoria", "Brazos", "Brewster", "Briscoe", "Brooks", "Brown",
    "Burleson", "Burnet", "Caldwell", "Calhoun", "Callahan", "Cameron", "Camp", "Carson",
    "Cass", "Castro", "Chambers", "Cherokee", "Childress", "Clay", "Cochran", "Coke",
    "Coleman", "Collin", "Collingsworth", "Colorado", "Comal", "Comanche", "Concho",
    "Cooke", "Coryell", "Cottle", "Crane", "Crockett", "Crosby", "Culberson", "Dallam",
    "Dallas", "Dawson", "Deaf Smith", "Delta", "Denton", "DeWitt", "Dickens", "Dimmit",
    "Donley", "Duval", "Eastland", "Ector", "Edwards", "Ellis", "El Paso", "Erath", "Falls",
    "Fannin", "Fayette", "Fisher"
]
const states = [
                {id: "AK",
                 summarizeType: "FULL",
                 counties: alaskaCounties,
                 congressionalDistricts: 1
                }, 
                {id: "AL",
                 summarizeType: "FULL",
                 counties: alabamaCounties,
                 congressionalDistricts: 10
                }, 
                {id: "AR",
                 summarizeType: "FULL",
                 congressionalDistricts: 7
                }, 
                {id: "AZ",
                 summarizeType: "FULL",
                 congressionalDistricts: 9
                }, 
                {id: "CA",
                 summarizeType: "BRIEF",
                 counties: californiaCounties,
                 congressionalDistricts: 53
                }, 
                {id: "CO",
                 summarizeType: "FULL",
                 congressionalDistricts: 7
                }, 
                {id: "CT",
                 summarizeType: "FULL",
                 congressionalDistricts: 6
                }, 
                {id: "DC",
                 summarizeType: "FULL",
                 congressionalDistricts: 1
                }, 
                {id: "DE",
                 summarizeType: "FULL",
                 congressionalDistricts: 1
                }, 
                {id: "FL",
                 summarizeType: "FULL",
                 congressionalDistricts: 27
                }, 
                {id: "GA",
                 summarizeType: "FULL",
                 congressionalDistricts: 14
                }, 
                {id: "HI",
                 summarizeType: "FULL",
                 congressionalDistricts: 2
                }, 
                {id: "ID",
                 summarizeType: "FULL",
                 congressionalDistricts: 2
                }, 
                {id: "IL",
                 summarizeType: "FULL",
                 congressionalDistricts: 26
                }, 
                {id: "IN",
                 summarizeType: "FULL",
                 congressionalDistricts: 13
                }, 
                {id: "IO",
                 summarizeType: "FULL",
                 congressionalDistricts: 11
                }, 
                {id: "KS",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "KY",
                 summarizeType: "FULL",
                 congressionalDistricts: 13
                }, 
                {id: "LA",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "MA",
                 summarizeType: "FULL",
                 congressionalDistricts: 20
                }, 
                {id: "MD",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "ME",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "MI",
                 summarizeType: "FULL",
                 congressionalDistricts: 19
                }, 
                {id: "MN",
                 summarizeType: "FULL",
                 congressionalDistricts: 10
                }, 
                {id: "MO",
                 summarizeType: "FULL",
                 congressionalDistricts: 16
                }, 
                {id: "MS",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "MT",
                 summarizeType: "FULL",
                 congressionalDistricts: 2
                }, 
                {id: "NC",
                 summarizeType: "FULL",
                 counties: northCarolinaCounties,
                 congressionalDistricts: 13
                }, 
                {id: "ND",
                 summarizeType: "FULL",
                 congressionalDistricts: 3
                }, 
                {id: "NE",
                 summarizeType: "FULL",
                 congressionalDistricts: 6
                }, 
                {id: "NH",
                 summarizeType: "FULL",
                 congressionalDistricts: 4
                }, 
                {id: "NJ",
                 summarizeType: "BRIEF",
                 counties: newJerseyCounties,
                 congressionalDistricts: 15
                }, 
                {id: "NM",
                 summarizeType: "FULL",
                 congressionalDistricts: 3
                }, 
                {id: "NV",
                 summarizeType: "FULL",
                 congressionalDistricts: 4
                }, 
                {id: "NY",
                 summarizeType: "BRIEF",
                 counties: newYorkCounties,
                 congressionalDistricts: 45
                }, 
                {id: "OH",
                 summarizeType: "FULL",
                 congressionalDistricts: 24
                }, 
                {id: "OK",
                 summarizeType: "FULL",
                 congressionalDistricts: 8
                }, 
                {id: "OR",
                 summarizeType: "FULL",
                 congressionalDistricts: 5
                }, 
                {id: "PA",
                 summarizeType: "FULL",
                 congressionalDistricts: 36
                }, 
                {id: "RI",
                 summarizeType: "FULL",
                 congressionalDistricts: 3
                }, 
                {id: "SC",
                 summarizeType: "FULL",
                 congressionalDistricts: 9
                }, 
                {id: "SD",
                 summarizeType: "FULL",
                 congressionalDistricts: 3
                }, 
                {id: "TN",
                 summarizeType: "FULL",
                 congressionalDistricts: 13
                }, 
                {id: "TX",
                 summarizeType: "BRIEF",
                 counties: texasCounties,
                 congressionalDistricts: 36
                }, 
                {id: "UT",
                 summarizeType: "FULL",
                 congressionalDistricts: 4
                }, 
                {id: "VA",
                 summarizeType: "FULL",
                 congressionalDistricts: 23
                }, 
                {id: "VT",
                 summarizeType: "FULL",
                 congressionalDistricts: 6
                }, 
                {id: "WA",
                 summarizeType: "FULL",
                 congressionalDistricts: 10
                }, 
                {id: "WV",
                 summarizeType: "FULL",
                 congressionalDistricts: 6
                }, 
                {id: "WI",
                 summarizeType: "FULL",
                 congressionalDistricts: 11
                }, 
                {id: "WY",
                 summarizeType: "FULL",
                 congressionalDistricts: 1
                }, 
            ]

const years = [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010]

const waitFor = async(num) => {
    setTimeout( () => {
        log("Timer expired")
        Promise.resolve()
    }, num)    
}

const asyncForEach = (async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
})

const asyncForLoop = (async (count, callback) => {
    for (let index = 0; index < count; index++) {
      await callback(index);
    }
})

const start = async () => {
    await asyncForEach([1, 2, 3], async (num) => {
      await waitFor(50);
      console.log(num);
    });
    console.log('Done');
}
   
log4js.configure({
    // appenders: { h1bData: { type: 'file', filename: 'h1bData.log' } },
    appenders: { h1bData: { type: 'console' } },
    categories: { default: { appenders: ['h1bData'], level: 'info' } }
});
const modelMap = require('./models/dbRecords')
const { summarize, summarizeMajor, createKey } = require('./utilities/summarize')

const logger = log4js.getLogger('h1bData');

const processState = ( async(year, stateRecord) => {
    const worksiteState = stateRecord.id
    const summarizeType = stateRecord.summarizeType
    const congDistCount = stateRecord.congressionalDistricts
    try{
        logger.info(chalk.bgHex("#0aee0a").black("Process State Year: " + year + " - State: " + worksiteState + " - Type: " + summarizeType))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = worksiteState
        await queryAndSave(query, summarizeType)
        // const h1bRecords = await queryDB(query)
        // var h1bObject = {}
        // if("FULL" == summarizeType){
        //     h1bObject = summarize(h1bRecords, query)
        // }else{
        //     h1bObject = summarizeMajor(h1bRecords, query)
        // }
        // await saveSummary(h1bObject)
        logger.trace(chalk.bgBlue('End of block'))
        await processCongDistricts(year, worksiteState, congDistCount)
    
    }catch(e){
        logger.error(chalk.bgRed(`Process State, ${worksiteState}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const queryDB = async (query) => {
    const h1bModel = modelMap[query.YEAR]
    logger.trace(chalk.bgBlue('query: ' + JSON.stringify(query)))
    key = createKey(query)
    logger.trace(chalk.bgBlue("Key: " + key + ' -- query: ' + JSON.stringify(query)))

    logger.trace(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
    const h1bRecords = await h1bModel.find(query)
    logger.trace(chalk.bgBlue('Read data complete'))
    return Promise.resolve(h1bRecords) 
}

const saveSummary = async(h1bObject) => {
    logger.trace(chalk.bgBlue('Data summarized'))
    logger.trace(JSON.stringify(h1bObject, undefined, 2))
    var summaryRecord = {
        "key": key,
        "summary": h1bObject
    }
    logger.trace(chalk.bgBlue('Save summary started'))
    const summaryModel = modelMap['summary']
    const h1bSummary = summaryModel(summaryRecord)
    logger.trace(chalk.bgBlue('Save summary start'))
    await h1bSummary.save()
    logger.trace(chalk.bgBlue('Save summary complete'))
}

const queryAndSave = async (query, summarizeType) => {
    const h1bRecords = await queryDB(query)
    const h1bObject = ("BRIEF" == summarizeType) ? summarizeMajor(h1bRecords, query) : summarize(h1bRecords, query)
    await saveSummary(h1bObject)
}

const processCounty = ( async(year, state, county) => {
    try{
        county = county.toUpperCase()
        logger.info(chalk.bgHex("#0aee0a").black("Process County Year: " + year + " - State: " + state + " - County: " + county))
        const h1bModel = modelMap[year]
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_COUNTY] = county
        await queryAndSave(query)
        // logger.trace(chalk.bgRed('query: ' + JSON.stringify(query)))
        // key = createKey(query)
        // logger.info(chalk.bgRed("Key: " + key + ' -- query: ' + JSON.stringify(query)))
    
        // logger.trace(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
        // const h1bRecords = await h1bModel.find(query)
        // logger.trace(chalk.bgBlue('Read data complete'))
        // var h1bObject = summarize(h1bRecords, query)
        // await saveSummary(h1bObject)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process County, ${county} County, ${state}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processCongDistrict = ( async(year, state, index) => {
    try{
        logger.info(chalk.bgHex("#0aee0a").black("Process Congress District Year: " + year + " - State: " + state +
                         " - Congressional District: " + index))
        const h1bModel = modelMap[year]
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_CONGRESS_DISTRICT] = index
        await queryAndSave(query)
        // const h1bRecords = await queryDB(query)
        // logger.trace(chalk.bgRed('query: ' + JSON.stringify(query)))
        // const key = createKey(query)
        // logger.info(chalk.bgRed("Key: " + key + ' -- query: ' + JSON.stringify(query)))
    
        // logger.trace(chalk.bgBlue('Read data started. query: ' + JSON.stringify(query)))
        // const h1bRecords = await h1bModel.find(query)
        // logger.trace(chalk.bgBlue('Read data complete'))
        //var h1bObject = summarize(h1bRecords, query)
        //await saveSummary(h1bObject)
        // logger.trace(chalk.bgBlue('Data summarized'))
        // logger.trace(JSON.stringify(h1bObject, undefined, 2))
        // var summaryRecord = {
        //     "key": key,
        //     "summary": h1bObject
        // }
        // logger.trace(chalk.bgBlue('Save summary started'))
        // const summaryModel = modelMap['summary']
        // const h1bSummary = summaryModel(summaryRecord)
        // logger.trace(chalk.bgBlue('Save summary start'))
        // await h1bSummary.save()
        // logger.trace(chalk.bgBlue('Save summary complete'))
        // // return Promise.resolve()
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process Congressional District, ${index}, ${state}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processStates = async (year) => {
    try{
        await asyncForEach(states, async(stateRecord) => {
           try{
                await processState(year, stateRecord)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${stateRecord.id} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other states.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed('Process States FAILED.'))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processCounties = async (year, state, counties) => {
    try{
        await asyncForEach(counties, async(county) => {
           try{
                await processCounty(year, state, county)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${county} County, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other counties.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Counties FAILED.`))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}

const processCongDistricts = async (year, state, congDistCount) => {
    try{
        await asyncForLoop(congDistCount, async(index) => {
           try{
                const congDistrict = index + 1
                await processCongDistrict(year, state, congDistrict)
            }catch(e){
                logger.error(chalk.bgRed(`Processing Congressional District ${congDistrict}, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other counties.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Counties FAILED.`))
        // return Promise.reject(e)
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}
const processYears = (async () => {
    try{
        await asyncForEach(years, async(year) => {
            logger.info("Process Year: " + year)
            currentYear = year
            try{
                await processStates(year)
                await processCounties(year, 'AK', alaskaCounties)
                await processCounties(year, 'AL', alabamaCounties)
                await processCounties(year, 'CA', californiaCounties)
                await processCounties(year, 'NC', northCarolinaCounties)
                await processCounties(year, 'NJ', newJerseyCounties)
                await processCounties(year, 'NY', newYorkCounties)
                await processCounties(year, 'TX', texasCounties)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${year} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other years.'))
            }
            
        })
    }catch(e){
        logger.error(chalk.bgRed('Process Years FAILED'))
        // return Promise.reject(e)
    }
    logger.info(chalk.bgBlue('End of building summaries'))
    return Promise.resolve
})

const bldSummaries = async () => {

    logger.info('Build summaries');
    // start()
    logger.info("Started")
    await processYears()

    setTimeout( () => {
        log("Timer expired")
    }, 0)
    logger.info(chalk.bgRed.bold("Build complete"))
    process.exit()
 }

bldSummaries();

