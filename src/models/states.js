const { alaskaCounties, alabamaCounties, arkansasCounties, arizonaCounties, californiaCounties,
    coloradoCounties, connecticutCounties, delawareCounties, floridaCounties, georgiaCounties,
    hawaiiCounties, idahoCounties, illinoisCounties, indianaCounties, iowaCounties,
    kansasCounties, kentuckyCounties, louisianaCounties, marylandCounties, maineCounties,
    massachusettsCounties, michiganCounties, minnesotaCounties, mississippiCounties,
    missouriCounties, montanaCounties, nebraskaCounties, newHampshireCounties, newJerseyCounties,
    newMexicoCounties, newYorkCounties, nevadaCounties, northCarolinaCounties, northDakotaCounties,
    ohioCounties, oklahomaCounties, oregonCounties, pennsylvaniaCounties, puertoRicoCounties,
    rhodeIslandCounties, southCarolinaCounties, southDakotaCounties, tennesseeCounties,
    texasCounties, utahCounties, vermontCounties, virginiaCounties, washingtonCounties,
    westVirginaCounties, wisconsinCounties, wyomingCounties }
        = require('./counties')

const {
    alaskaCities, alabamaCities, arkansasCities, arizonaCities, californiaCities, coloradoCities,
    connecticutCities, dcCities, delawareCities, floridaCities, georgiaCities, guamCities,
    hawaiiCities, idahoCities, illinoisCities, indianaCities, iowaCities, kansasCities,
    kentuckyCities, louisianaCities, marylandCities, maineCities, massachusettsCities,
    michiganCities, minnesotaCities, mississippiCities, missouriCities, montanaCities,
    nebraskaCities, newHampshireCities, newJerseyCities, newMexicoCities, newYorkCities,
    nevadaCities, northCarolinaCities, northDakotaCities, northernMarianaIslandsCities,
    ohioCities, oklahomaCities, oregonCities, pennsylvaniaCities, puertoRicoCities, rhodeIslandCities,
    southCarolinaCities, southDakotaCities, tennesseeCities, texasCities, utahCities,
    vermontCities, virginIslandsCities, virginiaCities, washingtonCities, westVirginaCities,
    wisconsinCities, wyomingCities } 
        = require('./cities')

const states = [
    {id: "AK",
     counties: alaskaCounties,
     cities: alaskaCities,
     congressionalDistricts: 1
    }, 
    {id: "AL",
     counties: alabamaCounties,
     cities: alabamaCities,
     congressionalDistricts: 7
    }, 
    {id: "AR",
     counties: arkansasCounties,
     cities: arkansasCities,
     congressionalDistricts: 4
    }, 
    {id: "AZ",
     counties: arizonaCounties,
     cities: arizonaCities,
     congressionalDistricts: 9
    }, 
    {id: "CA",
     counties: californiaCounties,
     cities: californiaCities,
     congressionalDistricts: 53
    }, 
    {id: "CO",
     counties: coloradoCounties,
     cities: coloradoCities,
     congressionalDistricts: 7
    }, 
    {id: "CT",
     counties: connecticutCounties,
     cities: connecticutCities,
     congressionalDistricts: 5
    }, 
    {id: "DC",
     cities: dcCities,
     congressionalDistricts: 1
    }, 
    {id: "DE",
     counties: delawareCounties,
     cities: delawareCities,
     congressionalDistricts: 1
    }, 
    {id: "FL",
     counties: floridaCounties,
     cities: floridaCities,
     congressionalDistricts: 27
    }, 
    {id: "GA",
     counties: georgiaCounties,
     cities: georgiaCities,
     congressionalDistricts: 14
    }, 
    {id: "GU",
     cities: guamCities
    }, 
    {id: "HI",
     counties: hawaiiCounties,
     cities: hawaiiCities,
     congressionalDistricts: 2
    }, 
    {id: "ID",
     counties: idahoCounties,
     cities: idahoCities,
     congressionalDistricts: 2
    }, 
    {id: "IL",
     counties: illinoisCounties,
     cities: illinoisCities,
     congressionalDistricts: 18
    }, 
    {id: "IN",
     counties: indianaCounties,
     cities: indianaCities,
     congressionalDistricts: 9
    }, 
    {id: "IO",
     counties: iowaCounties,
     cities: iowaCities,
     congressionalDistricts: 4
    }, 
    {id: "KS",
     counties: kansasCounties,
     cities: kansasCities,
     congressionalDistricts: 4
    }, 
    {id: "KY",
     counties: kentuckyCounties,
     cities: kentuckyCities,
     congressionalDistricts: 6
    }, 
    {id: "LA",
     counties: louisianaCounties,
     cities: louisianaCities,
     congressionalDistricts: 6
    }, 
    {id: "MA",
     counties: massachusettsCounties,
     cities: massachusettsCities,
     congressionalDistricts: 9
    }, 
    {id: "MD",
     counties: marylandCounties,
     cities: marylandCities,
     congressionalDistricts: 8
    }, 
    {id: "ME",
     counties: maineCounties,
     cities: maineCities,
     congressionalDistricts: 2
    }, 
    {id: "MI",
     counties: michiganCounties,
     cities: michiganCities,
     congressionalDistricts: 14
    }, 
    {id: "MN",
     counties: minnesotaCounties,
     cities: minnesotaCities,
     congressionalDistricts: 8
    }, 
    {id: "MO",
     counties: missouriCounties,
     cities: missouriCities,
     congressionalDistricts: 8
    }, 
    {id: "MP",
     cities: northernMarianaIslandsCities
    }, 
    {id: "MS",
     counties: mississippiCounties,
     cities: mississippiCities,
     congressionalDistricts: 4
    }, 
    {id: "MT",
     counties: montanaCounties,
     cities: montanaCities,
     congressionalDistricts: 1
    }, 
    {id: "NC",
     counties: northCarolinaCounties,
     cities: northCarolinaCities,
     congressionalDistricts: 13
    }, 
    {id: "ND",
     counties: northDakotaCounties,
     cities: northDakotaCities,
     congressionalDistricts: 1
    }, 
    {id: "NE",
     counties: nebraskaCounties,
     cities: nebraskaCities,
     congressionalDistricts: 3
    }, 
    {id: "NH",
     counties: newHampshireCounties,
     cities: newHampshireCities,
     congressionalDistricts: 2
    }, 
    {id: "NJ",
     counties: newJerseyCounties,
     cities: newJerseyCities,
     congressionalDistricts: 12
    }, 
    {id: "NM",
     counties: newMexicoCounties,
     cities: newMexicoCities,
     congressionalDistricts: 3
    }, 
    {id: "NV",
     counties: nevadaCounties,
     cities: nevadaCities,
     congressionalDistricts: 4
    }, 
    {id: "NY",
     counties: newYorkCounties,
     cities: newYorkCities,
     congressionalDistricts: 27
    }, 
    {id: "OH",
     counties: ohioCounties,
     cities: ohioCities,
     congressionalDistricts: 16
    }, 
    {id: "OK",
     counties: oklahomaCounties,
     cities: oklahomaCities,
     congressionalDistricts: 5
    }, 
    {id: "OR",
     counties: oregonCounties,
     cities: oregonCities,
     congressionalDistricts: 5
    }, 
    {id: "PA",
     counties: pennsylvaniaCounties,
     cities: pennsylvaniaCities,
     congressionalDistricts: 18
    }, 
    {id: "PR",
     counties: puertoRicoCounties,
     cities: puertoRicoCities
    }, 
    {id: "RI",
     counties: rhodeIslandCounties,
     cities: rhodeIslandCities,
     congressionalDistricts: 2
    }, 
    {id: "SC",
     counties: southCarolinaCounties,
     cities: southCarolinaCities,
     congressionalDistricts: 7
    }, 
    {id: "SD",
     counties: southDakotaCounties,
     cities: southDakotaCities,
     congressionalDistricts: 3
    }, 
    {id: "TN",
     counties: tennesseeCounties,
     cities: tennesseeCities,
     congressionalDistricts: 9
    }, 
    {id: "TX",
     counties: texasCounties,
     cities: texasCities,
     congressionalDistricts: 36
    }, 
    {id: "UT",
     counties:utahCounties,
     cities: utahCities,
     congressionalDistricts: 4
    }, 
    {id: "VA",
     counties: virginiaCounties,
     cities: virginiaCities,
     congressionalDistricts: 23
    }, 
    {id: "VI",
     cities: virginIslandsCities
    }, 
    {id: "VT",
     counties: vermontCounties,
     cities: vermontCities,
     congressionalDistricts: 1
    }, 
    {id: "WA",
     counties: washingtonCounties,
     cities: washingtonCities,
     congressionalDistricts: 10
    }, 
    {id: "WV",
     counties: westVirginaCounties,
     cities: westVirginaCities,
     congressionalDistricts: 3
    }, 
    {id: "WI",
     counties: wisconsinCounties,
     cities: wisconsinCities,
     congressionalDistricts: 8
    }, 
    {id: "WY",
     counties: wyomingCounties,
     cities: wyomingCities,
     congressionalDistricts: 1
    },
]
module.exports = {states}