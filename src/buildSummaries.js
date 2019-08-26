const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const _ = require('lodash')

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
const alaskaCities = ["Anchorage", "Fairbanks", "Homer", "Juneau", "Nome"]
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
const alabamaCities = [
    "Birmingham", "Huntsville", "Montgomery", "Mobile", "Tuscaloosa"
]
const arizonaCounties = [
    "Apache", "Cochise", "Coconino", "Gila", "Graham", "Greenlee", "La Paz",
    "Maricopa", "Mohave", "Navajo", "Pima", "Pinal", "Santa Cruz", "Yavapai",
    "Yuma"
]
const arizonaCities = [
    "Chandler", "Flagstaff", "Mesa", "Phoenix", "Prescott", "Scottsdale", "Sedona", "Tempe", 
    "Tucson", "Yuma"
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
const californiaCities = [
    "Anaheim", "Fresno", "Hayward", "Los Angeles", "Los Gatos", "Milpitas", "Mountain View", "Oakland",
    "Palm Springs", "Palo Alto", "Pasadena",
    "Redding", "Sacramento", "San Diego", "San Francisco", 
    "San Jose", "San Mateo", "Santa Barbara", "Santa Clara", "Santa Monica", "Santa Rosa",
    "San Luis Obispo", "Sunnyvale"
]
const coloradoCounties = [
    "Adams", "Alamosa", "Arapahoe", "Archuleta", "Baca", "Bent", "Boulder", "Broomfield",
    "Chaffee", "Cheyenne", "Clear Creek", "Conejos", "Costilla", "Crowley", "Custer", "Delta",
    "Denver", "Dolores", "Douglas", "Eagle", "El Paso", "Elbert", "Fremont", "Garfield", "Gilpin",
    "Grand", "Gunnison", "Hinsdale", "Huerfano", "Jackson", "Jefferson", "Kit Carson", "La Plata",
    "Lake", "Larimer", "Las Animas", "Lincoln", "Logan", "Mesa", "Mineral", "Moffat", "Montezuma",
    "Montrose", "Morgan", "Otero", "Ouray", "Park", "Phillips", "Pitkin", "Prowers", "Pueblo",
    "Rio Blanco", "Rio Grande", "Routt", "Saguache", "San Juan", "San Miguel", "Sedgwick",
    "Summitt", "Teller", "Washington", "Weld", "Yuma"
]
const coloradoCities = [
    "Boulder", "Colorado Springs", "Denver", "Fort Collins"
]
const connecticutCounties = [
    "Fairfield", "Hartford", "Litchfield", "Middlesex", "New Haven", "New London",
    "Tolland", "Windham"
]
const connecticutCities = [
    "Fairfield", "Hartford", "Litchfield", "Middletown", "New Haven", "New London",
    "Norwalk", "Rockville"
]
const floridaCounties = [
    "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus",
    "Clay", "Collier", "Columbia", "DeSota", "Dixie", "Duval", "Escambia", "Flagler", "Franklin",
    "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands",
    "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon",
    "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Dade", "Miami-Dade", "Monroe", "Nassau",
    "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam",
    "St. Johns", "Santa Rosa", "Sarasota", "Seminole", "Sumter", "Suwannee", "Taylor", "Union", "Volusia",
    "Wakulla", "Walton", "Washington"
]
const floridaCities = [
    "Boca Raton", "Davie", "Daytona Beach", "Deerfield Beach", "Delray Beach", "Fort Lauderdale", "Hialeah",
    "Jacksonville", 
    "Juno Beach", "Kendall", "Key West", "Kissimmee", "Lake Buena Vista", "Lake Mary", "Melbourne", "Miami", 
    "Miami Beach", "Orlando", "Palm Beach", "Palm Beach Gardens", "Panama City", "Pensacola", 
    "Sarasota", "St. Petersburg", "Tallahassee", "Tampa",
    "West Palm Beach"
]
const georgiaCounties = [ 
    "Appling", "Atkinson", "Bacon", "Baker", "Baldwin", "Banks", "Barrow", "Bartow", "Ben Hill",
    "Berrien", "Bibb", "Bleckley", "Brantley", "Brooks", "Bryan", "Bulloch", "Burke", "Butts",
    "Calhoun", "Camden", "Candler", "Carroll", "Catoosa", "Charlton", "Chatham", "Chattahoochee",
    "Chattooga", "Cherokee", "Clarke", "Clay", "Clayton", "Clinch", "Cobb", "Coffee", "Colquitt",
    "Columbia", "Cook", "Coweta", "Crawford", "Crisp", "Dade", "Dawson", "Decatur", "DeKalb", 
    "Dodge", "Dooly", "Dougherty", "Douglas", "Early", "Echols", "Effingham", "Elbert", "Emanuel",
    "Evans", "Fannin", "Fayette", "Floyd", "Forsyth", "Franklin", "Fulton", "Gilmer", "Glascock",
    "Glynn", "Gordon", "Grady", "Greene", "Gwinnett", "Habersham", "Hall", "Hancock", "Haralson",
    "Harris", "Hart", "Heard", "Henry", "Houston", "Irwin", "Jackson", "Jasper", "Jeff Davis",
    "Jefferson", "Jenkins", "Johnson", "Jones", "Lamar", "Lanier", "Laurens", "Lee", "Liberty",
    "Lincoln", "Long", "Lowndes", "Lumpkin", "Macon", "Madison", "Marion", "McDuffie", "McIntosh",
    "Meriwether", "Miller", "Mitchell", "Monroe", "Montgomery", "Morgan", "Murray", "Muscogee",
    "Newton", "Oconee", "Oglethorpe", "Paulding", "Peach", "Pickens", "Pierce", "Pike", "Polk",
    "Pulaski", "Putnam", "Quitman", "Rabun", "Randolph", "Richmond", "Rockdale", "Schley",
    "Screven", "Seminole", "Spalding", "Stephens", "Stewart", "Sumter", "Talbot", "Taliaferro",
    "Tattnall", "Taylor", "Telfair", "Terrell", "Thomas", "Tift", "Toombs", "Towns", "Treutlen",
    "Troup", "Turner", "Twiggs", "Union", "Upson", "Walker", "Walton", "Ware", "Warren", "Washington",
    "Wayne", "Webster", "Wheeler", "White", "Whitfield", "Wilcox", "Wilkes", "Wilkinson", "Worth"
]
const georgiaCities = [ 
    "Alpharetta", "Augusta", "Atlanta", "College Park", "Columbus", "Kennesaw", "Macon", "Marietta",
    "Savannah", "Valdosta"
]
const marylandCounties = [ 
    "Allegany", "Anne Arundel", "Baltimore", "Calvert", "Caroline", "Carroll", "Cecil", "Charles",
    "Dorchester", "Frederic", "Garrett", "Hartford", "Howard", "Kent", "Montgomery", "Prince Georges",
    "Queen Annes", "Saint Marys", "Somerset", "Talbot", "Washington", "Wicomico", "Worcester"
]
const marylandCities = [ 
    "Annapolis", "Baltimore", "Chevy Chase", "College Park", "Cumberland", "Rockville", "Salisbury",
    "Silver Spring", "Towson"
]
const newJerseyCounties = [ 
    "Atlantic", "Bergen", "Burlington", "Camden", "Cape May",
    "Cumberland", "Essex", "Gloucester", "Hudson", "Hunterdon", "Mercer", "Middlesex",
    "Monmouth", "Morris", "Ocean", "Passaic", "Salem", "Somerset", "Sussex", "Union", "Warren"
]
const newJerseyCities = [ 
    "Camden", "Edison", "Elizabeth", "Jersey City", "Newark", "New Brunswick", "Paterson",
    "Princeton", "Trenton", "Union City"
]
const newMexicoCounties = [ 
    "Bernalillo", "Catron", "Chaves", "Cibola", "Colfax", "Curry", "De Baca", "Dona Ana", "Eddy",
    "Grant", "Guadalupe", "Harding", "Hidalgo", "Lea", "Lincoln", "Los Alamos","Luna", "McKinley",
    "Mora", "Otero", "Quay", "Rio Arriba", "Roosevelt", "Sandoval", "San Juan", "San Miguel",
    "Santa Fe", "Sierra", "Socorro", "Taos", "Torrance", "Union", "Valencia"
]
const newMexicoCities = [ 
    "Albuquerque", "Gallup", "Las Cruces", "Los Alamos", "Roswell", "Santa Fe"
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
const newYorkCities = [ 
    "Albany", "Binghamton", "Bronx", "Brooklyn", "Buffalo", "New York", "White Plains"
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
const northCarolinaCities = [
    "Asheville", "Boone", "Cary", "Charlotte", "Durham", "Greensboro", "High Point",
    "Raleigh", "Research Triangle Park", "Wilmington", "Wilson", "Winston Salem"
]
const ohioCounties = [
    "Adams", "Allen", "Ashland", "Ashtabula", "Athens", "Auglaize", "Belmont", "Brown",
    "Butler", "Carroll", "Champaign", "Clark", "Clermont", "Clinton", "Columbiana",
    "Coshocton", "Crawford", "Cuyahoga", "Darke", "Defiance", "Delaware", "Erie", "Fairfield",
    "Fayette", "Franklin", "Fulton", "Gallia", "Geauga", "Greene", "Guernsey", "Hamilton",
    "Hancock", "Hardin", "Harrison", "Henry", "Highland", "Hocking", "Holmes", "Huron",
    "Jackson", "Jefferson", "Knox", "Lake", "Lawrence", "Licking", "Logan", "Lorain", "Lucas",
    "Madison", "Mahoning", "Marion", "Median", "Meigs", "Mercer", "Miami", "Monroe", "Montgomery",
    "Morgan", "Morrow", "Muskingum", "Noble", "Ottawa", "Paulding", "Perry", "Pickaway", "Pike",
    "Portage", "Preble", "Putnam", "Richland", "Ross", "Sandusky", "Scioto", "Senaca", "Shelby",
    "Stark", "Summit", "Trumbull", "Tuscarawas", "Union", "Van Wert", "Vinton", "Warren",
    "Washington", "Wayne", "Williams", "Wood", "Wyandot"
]
const ohioCities = [
    "Cincinnati", "Cleveland", "Columbus", "Dayton", "Toledo", "Youngstown"
]
const pennsylvaniaCounties = [
    "Adams", "Allegheny", "Armstrong", "Beaver", "Bedford", "Berks", "Blair", "Bradford",
    "Bucks", "Butler", "Cambria", "Cameron", "Carbon", "Centre", "Chester", "Clarion",
    "Clearfield", "Clinton", "Columbia", "Crawford", "Cumberland", "Dauphin", "Delaware",
    "Elk", "Erie", "Fayette", "Forest", "Franklin", "Fulton", "Greene", "Huntingdon",
    "Indiana", "Jefferson", "Juniata", "Lackawanna", "Lancaster", "Lawrence", "Lebanon",
    "Lehigh", "Luzerne", "Lycoming", "McKean", "Mercer", "Mifflin", "Monroe", "Montgomery",
    "Montour", "Northampton", "Northumberland", "Perry", "Philadelphia", "Pike", "Potter",
    "Schuylkill", "Snyder", "Somerset", "Sullivan", "Susquehanna", "Tioga", "Union",
    "Venango", "Warren", "Washington", "Wayne", "Westmoreland", "Wyoming", "York"
]
const pennsylvaniaCities = [
    "ALlentown", "Bethlehem", "Erie", "Harrisburg", "Lancaster", "Philadelphia", "Pittsburgh",
    "Reading", "Scranton", "State College", "York", "Wilkes-Barre"
]
const southCarolinaCounties = [
    "Abbeville", "Aiken", "Allendale", "Anderson", "Bamberg", "Barnwell", "Beaufort", "Berkeley",
    "Calhoun", "Charleston", "Cherokee", "Chester", "Chesterfield", "Clarendon", "Colleton",
    "Darlington", "Dillon", "Dorchester", "Edgefield", "Fairfield", "Florence", "Georgetown",
    "Greenville", "Greenwood", "Hampton", "Horry", "Jasper", "Kershaw", "Lancaster", "Laurens",
    "Lee", "Lexington", "Marion", "Marlboro", "McCormick", "Newberry", "Oconee", "Orangeburg",
    "Pickens", "Richland", "Saluda", "Spartanburg", "Sumter", "Union", "Williamsburg", "York"
]
const southCarolinaCities = [
    "Beaufort", "Charleston", "Columbia", "Florence", "Greenville", "Myrtle Beach", "Spartanburg"
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
    "Fannin", "Fayette", "Fisher", "Floyd", "Foard", "Fort Bend", "Franklin", "Freestone",
    "Frio", "Gaines", "Galveston", "Garza", "Gillespie", "Glasscock", "Goliad", "Gonzales",
    "Gray", "Grayson", "Gregg", "Grimes", "Guadalupe", "Hale", "Hall", "Hamilton", "Hansford",
    "Hardeman", "Hardin", "Harris", "Harrison", "Hartley", "Haskell", "Hays", "Hemphill",
    "Henderson", "Hidalgo", "Hill", "Hockley", "Hood", "Hopkins", "Houston", "Howard",
    "Hudspeth", "Hunt", "Hutchinson", "Irion", "Jack", "Jackson", "Jasper", "Jeff Davis",
    "Jefferson", "Jim Hogg", "Jim Wells", "Johnson", "Jones", "Karnes", "Kaufman", "Kendall",
    "Kenedy", "Kent", "Kerr", "Kimble", "King", "Kinney", "Kleberg", "Knox", "Lamar", "Lamb",
    "Lampasas", "La Salle", "Lavaca", "Lee", "Leon", "Liberty", "Limestone", "Libscomb", "Live Oak",
    "Llano", "Loving", "Lubbock", "Lynn", "McCulloch", "McLennan", "McMullen", "Madison", "Marion",
    "Martin", "Mason", "Matagorda", "Maverick", "Medina", "Menard", "Midland", "Milam", "Mills",
    "Mitchell", "Montague", "Montgomery", "Moore", "Morris", "Motley", "Nacogdoches", "Navarro",
    "Newton", "Nolan", "Nueces", "Ochiltree", "Oldham", "Orange", "Palo Pinto", "Panola", "Parker",
    "Parmer", "Pecos", "Polk", "Potter", "Presidio", "Rains", "Randall", "Reagan", "Real", "Red River",
    "Reeves", "Refugio", "Roberto", "Robertson", "Rockwell", "Runnels", "Rusk", "Sabine", "San Augustine",
    "San Jacinto", "San Patricio", "San Saba", "Schleicher", "Scurry", "Shackelford", "Shelby", "Sherman",
    "Smith", "Somervell", "Starr", "Stephens", "Sterling", "Stonewall", "Sutton", "Swisher", "Tarrant",
    "Taylor", "Terrell", "Terry", "Throckmorton", "Titus", "Tom Green", "Travis", "Tritiny", "Tyler",
    "Upshur", "Upton", "Uvalde", "Val Verde", "Van Zandt", "Victoria", "Walker", "Waller", "Ward",
    "Washington", "Webb", "Wharton", "Wheeler", "Wichita", "Wilbarger", "Willacy", "Williamson",
    "Wilson", "Winkler", "Wise", "Wood", "Yoakum", "Young", "Zapata", "Zavala"
]
const texasCities = [
    "Abilene", "Amarillo", "Arlington", "Austin", "Beaumont", "College Station", "Corpus Christi", "Dallas", "El Paso",
    "Fort Worth", "Galveston", "Houston", "Huntsville", "Irving", "Lubbock", "Midland", "Odessa", "Plano", "Richardson",
    "Round Rock", "San Angelo", "San Antonio", "Waco"
]
const utahCounties = [
    "Beaver", "Box Elder", "Cache", "Carbon", "Daggett", "Davis", "Duchesne", "Emery", "Garfield",
    "Grand", "Iron", "Juab", "Kane", "Millard", "Morgan", "Piute", "Rich", "Salt Lake", "San Juan",
    "Sanpete", "Sevier", "Summit", "Tooele", "Uintah", "Utah", "Wasatch", "Washington", "Wayne",
    "Weber"
]
const utahCities = [
    "Ogden", "Provo", "Salt Lake City"
]
const virginiaCounties = [
    "Accomack", "Albemarle", "Alleghany", "Amelia", "Amherst", "Appomattox", "Arlington", "Augusta",
    "Bath", "Bedford", "Bland", "Botetourt", "Brunswick", "Buchanan", "Buckingham", "Campbell",
    "Caroline", "Carroll", "Charles City", "Charlotte", "Chesterfield", "Clarke", "Craig", "Culpeper",
    "Cumberland", "Dickenson", "Dinwiddie", "Essex", "Fairfax", "Fauquier", "Floyd", "Fluvanna", "Franklin",
    "Frederick", "Giles", "Gloucester", "Goochland", "Grayson", "Greene", "Greensville", "Halifax", "Hanover",
    "Henrico", "Henry", "Highland", "Isle of Wight", "James City", "King and Queen", "King George", 
    "King William", "Lancaster", "Lee", "Loudoun", "Louisa", "Lunenburg", "Madison", "Mathews", "Mecklenburg",
    "Middlesex", "Montgomery", "Nelson", "New Kent", "Northampton", "Northumberland", "Nottoway", "Orange",
    "Page", "Patrick", "Pittsylvania", "Powhatan", "Prince Edward", "Prince George", "Prince William", "Pulaski",
    "Rappahannock", "Richmond", "Roanoke", "Rockbridge", "Rockingham", "Russell", "Scott", "Shenandoah", "Smyth",
    "Southampton", "Spotsylvania", "Stafford", "Surry", "Sussex", "Tazewell", "Warren", "Washington",
    "Westmoreland", "Wise", "Wythe", "York"
]
const virginiaCities = [
    "Alexandria", "Arlington", "Charlottesville", "Chesapeake", "Fairfax", "Falls Church", "Herndon", 
    "Norfolk", "Richmond", "Roanoke"
]
const wyomingCounties = [
    "Albany", "Big Horn", "Campbell", "Carbon", "Converse", "Crook", "Fremont", "Goshen", "Hot Springs",
    "Johnson", "Laramie", "Lincoln", "Natrona", "Park", "Platte", "Sheridan", "Sublette", "Sweetwater",
    "Teton", "Uinta", "Washakie", "Weston"
]
const wyomingCities = [
    "Casper", "Cheyenne", "Jackson", "Laramie"
]
const states = [
                {id: "AK",
                 summarizeType: "FULL",
                 counties: alaskaCounties,
                 cities: alaskaCities,
                 congressionalDistricts: 1
                }, 
                {id: "AL",
                 summarizeType: "FULL",
                 counties: alabamaCounties,
                 cities: alabamaCities,
                 congressionalDistricts: 10
                }, 
                {id: "AR",
                 summarizeType: "FULL",
                 congressionalDistricts: 7
                }, 
                {id: "AZ",
                 summarizeType: "FULL",
                 counties: arizonaCounties,
                 cities: arizonaCities,
                 congressionalDistricts: 9
                }, 
                {id: "CA",
                 summarizeType: "BRIEF",
                 counties: californiaCounties,
                 cities: californiaCities,
                 congressionalDistricts: 53
                }, 
                {id: "CO",
                 summarizeType: "FULL",
                 counties: coloradoCounties,
                 cities: coloradoCities,
                 congressionalDistricts: 7
                }, 
                {id: "CT",
                 summarizeType: "FULL",
                 counties: connecticutCounties,
                 cities: connecticutCities,
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
                 counties: floridaCounties,
                 cities: floridaCities,
                 congressionalDistricts: 27
                }, 
                {id: "GA",
                 summarizeType: "FULL",
                 counties: georgiaCounties,
                 cities: georgiaCities,
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
                 counties: marylandCounties,
                 cities: marylandCities,
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
                 cities: northCarolinaCities,
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
                 cities: newJerseyCities,
                 congressionalDistricts: 15
                }, 
                {id: "NM",
                 counties: newMexicoCounties,
                 cities: newMexicoCities,
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
                 cities: newYorkCities,
                 congressionalDistricts: 45
                }, 
                {id: "OH",
                 summarizeType: "FULL",
                 counties: ohioCounties,
                 cities: ohioCities,
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
                 counties: pennsylvaniaCounties,
                 cities: pennsylvaniaCities,
                 congressionalDistricts: 36
                }, 
                {id: "RI",
                 summarizeType: "FULL",
                 congressionalDistricts: 3
                }, 
                {id: "SC",
                 summarizeType: "FULL",
                 counties: southCarolinaCounties,
                 cities: southCarolinaCities,
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
                 cities: texasCities,
                 congressionalDistricts: 36
                }, 
                {id: "UT",
                 summarizeType: "FULL",
                 counties:utahCounties,
                 cities: utahCities,
                 congressionalDistricts: 4
                }, 
                {id: "VA",
                 summarizeType: "FULL",
                 counties: virginiaCounties,
                 cities: virginiaCities,
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
                 counties: wyomingCounties,
                 cities: wyomingCities,
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
    const counties = stateRecord.counties
    const cities = stateRecord.cities
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
        if(!_.isEmpty(counties)){
            await processCounties(year, worksiteState, counties)
        }   
        if(!_.isEmpty(cities)){
            await processCities(year, worksiteState, cities)
        }   
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
        logger.info(chalk.bgHex("#ca4e0a").white.bold("Process County Year: " + year + " - State: " + state + " - County: " + county))
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

const processCity = ( async(year, state, city) => {
    try{
        city = city.toUpperCase()
        logger.info(chalk.bgHex("#0a9999").white.bold("Process City Year: " + year + " - State: " + state + " - City: " + city))
        const query = {}
        query[YEAR] = year
        query[WORKSITE_STATE] = state
        query[WORKSITE_CITY] = city
        await queryAndSave(query)
        logger.trace(chalk.bgBlue('End of block'))
    
    }catch(e){
        logger.error(chalk.bgRed(`Process City, ${city}, ${state}, failed: ` + e))
        throw(e)
    }
    return Promise.resolve
})

const processCongDistrict = ( async(year, state, index) => {
    try{
        logger.info(chalk.bgHex("#1133aa").white.bold("Process Congress District Year: " + year + " - State: " + state +
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

const processCities = async (year, state, cities) => {
    try{
        await asyncForEach(cities, async(city) => {
           try{
                await processCity(year, state, city)
            }catch(e){
                logger.error(chalk.bgRed(`Processing the city ${city}, ${state} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other cities.'))
            }
        })
    }catch(e){
        logger.error(chalk.bgRed(`Process ${state} Cities FAILED.`))
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
                // await processCounties(year, 'AK', alaskaCounties)
                // await processCounties(year, 'AL', alabamaCounties)
                // await processCounties(year, 'CA', californiaCounties)
                // await processCounties(year, 'NC', northCarolinaCounties)
                // await processCounties(year, 'NJ', newJerseyCounties)
                // await processCounties(year, 'NY', newYorkCounties)
                // await processCounties(year, 'TX', texasCounties)
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

