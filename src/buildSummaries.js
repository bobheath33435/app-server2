const mongoose = require('mongoose')
const log4js = require('log4js')
const chalk = require('chalk')
const si = require('systeminformation')
const moment = require('moment')
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
                            "St. Clair", "St Clair", "Saint Clair",
                            "Shelby", "Sumter", "Talladega", "Tallapoosa",
                            "Tuscaloosa", "Walker", "Washington", "Wilcox", "Winston"
                        ]
const alabamaCities = [
    "Birmingham", "Huntsville", "Montgomery", "Mobile", "Tuscaloosa"
]
const arkansasCounties = [ 
    "Arkansas", "Ashley", "Baxter", "Benton", "Boone", "Bradley", "Calhoun", "Carroll",
    "Chicot", "Clark", "Clay", "Cleburne", "Cleveland", "Columbia", "Conway", "Craighead",
    "Crawford", "Crittenden", "Cross", "Dallas", "Desha", "Drew", "Faulkner", "Franklin",
    "Fulton", "Garland", "Grant", "Greene", "Hempstead", "Hot Spring", "Howard", "Independence",
    "Izard", "Jackson", "Jefferson", "Johnson", "Lafayette", "Lawrence", "Lee", "Lincoln",
    "Little River", "Logan", "Lonoke", "Madison", "Marion", "Miller", "Mississippi", "Monroe",
    "Montgomery", "Nevada", "Newton", "Ouachita", "Perry", "Phillips", "Pike", "Poinsett",
    "Polk", "Pope", "Prairie", "Pulaski", "Randolph", "St. Francis", "St Francis", "Saint Francis",
    "Saline", "Scott", 
    "Searcy", "Sebastian", "Sevier", "Sharp", "Stone", "Union", "Van Buren", "Washington",
    "White", "Woodruff", "Yell"
]
const arkansasCities = [ 
    "Bentonville", "Fayetteville", "Fort Smith", "Hot Springs",
    "Little Rock", "Pine Bluff", "Texarkana", "West Memphis"
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
    "Anaheim", "Cupertino", "Fresno", "Hayward", "Los Angeles", "Los Gatos",
    "Milpitas", "Mountain View", "Oakland",
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
const dcCities = [
    "Washington"
]
const delawareCounties = [
    "Kent", "New Castle", "Sussex"
]
const delawareCities = [
    "Dover", "Newark", "Wilmington"
]
const floridaCounties = [
    "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus",
    "Clay", "Collier", "Columbia", "DeSota", "Dixie", "Duval", "Escambia", "Flagler", "Franklin",
    "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands",
    "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon",
    "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Dade", "Miami-Dade", "Monroe", "Nassau",
    "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam",
    "St. Johns", "St Johns", "Saint Johns",
    "Santa Rosa", "Sarasota", "Seminole", "Sumter", "Suwannee", "Taylor", "Union", "Volusia",
    "Wakulla", "Walton", "Washington"
]
const floridaCities = [
    "Boca Raton", "Davie", "Daytona Beach", "Deerfield Beach", "Delray Beach", "Fort Lauderdale", "Hialeah",
    "Jacksonville", 
    "Juno Beach", "Kendall", "Key West", "Kissimmee", "Lake Buena Vista", "Lake Mary", "Melbourne", "Miami", 
    "Miami Beach", "Orlando", "Palm Beach", "Palm Beach Gardens", "Panama City", "Pensacola", 
    "Sarasota", "St. Petersburg", "St Petersburg", "Saint Petersburg", "Tallahassee", "Tampa",
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
const guamCities = [ 
    "Agana", "Agat", "Barrigada", "Dededo", "Hagatna", "Harmon", "Inarajan", "Maite", 
    "Mangilao", "Piti", "Santa Rita", "Sinajana", "Tamuning", "Tiyan", "Tumon", "Upper Tumon", "Yigo"
]
const hawaiiCounties = [ 
    "Hawaii", "Honolulu", "Kalawao", "Kauai", "Maui"
]
const hawaiiCities = [ 
    "Honolulu", "Lihue"
]
const idahoCounties = [ 
    "Ada", "Adams", "Bannock", "Bear Lake", "Benewah", "Bingham", "Blaine", "Boise", "Bonner",
    "Bonneville", "Boundary", "Butte", "Camas", "Canyon", "Caribou", "Cassia", "Clark",
    "Clearwater", "Custer", "Elmore", "Franklin", "Fremont", "Gem", "Gooding", "Idaho",
    "Jefferson", "Jerome", "Koortenai", "Latah", "Lemhi", "Lewis", "Lincoln", "Madison",
    "Minidoka", "Nez Perce", "Oneida", "Owyhee", "Payette", "Power", "Shoshone", "Teton",
    "Twin Falls", "Valley", "Washington" 
]
const idahoCities = [ 
    "Coeur d'Alene", "Boise", "Idaho Falls"
]
const illinoisCounties = [ 
    "Adams", "Alexander", "Bond", "Boone", "Brown", "Bureau", "Calhoun", "Carroll", "Cass",
    "Champaign", "Christian", "Clark", "Clay", "Clinton", "Coles", "Cook", "Crawford", "Cumberland",
    "DeKalb", "DeWitt", "Douglas", "DuPage", "Edgar", "Edwards", "Effingham", "Fayette", "Ford",
    "Franklin", "Fulton", "Gallatin", "Greene", "Grundy", "Hamilton", "Hancock", "Hardin", "Henderson",
    "Henry", "Iroquois", "Jackson", "Jasper", "Jefferson", "Jersey", "Jo Daviess", "Johnson", "Kane",
    "Kankakee", "Kendall", "Knox", "Lake", "LaSalle", "Lawrence", "Lee", "Livingston", "Logan", "Macon",
    "Macoupin", "Madison", "Marion", "Marshall", "Mason", "Massac", "McDonough", "McHenry", "McLean",
    "Menard", "Mercer", "Monroe", "Montgomery", "Morgan", "Moultrie", "Ogle", "Peoria", "Perry", "Piatt",
    "Pike", "Pope", "Pulaski", "Putnam", "Randolph", "Richland", "Rock Island", "Saline", "Sangamon",
    "Schuyler", "Scott", "Shelby", "St. Clair", "Stark", "Stephenson", "Tazewell", "Union", "Vermilion",
    "Wabash", "Warren", "Washington", "Wayne", "White", "Whiteside", "Will", "Williamside", "Winnebago",
    "Woodford"
]
const illinoisCities = [
    "Bloomington", "Chicago", "Decatur", "Joliet", "Peoria", "Springfield", "Urbana"
]
const indianaCounties = [ 
    "Adams", "Allen", "Bartholomew", "Benton", "Blackford", "Boone", "Brown", "Carroll",
    "Cass", "Clark", "Clay", "Clinton", "Crawford", "Daviess", "Dearborn", "Decatur",
    "DeKalb", "Delaware", "Dubois", "Elkhart", "Fayette", "Floyd", "Fountain", "Franklin",
    "Fulton", "Gibson", "Grant", "Greene", "Hamilton", "Hancock", "Harrison", "Hendricks",
    "Henry", "Howard", "Huntington", "Jackson", "Jasper", "Jay", "Jefferson", "Jennings",
    "Johnson", "Knox", "Kosciusko", "LaGrange", "Lake", "LaPorte", "Lawrence", "Madison",
    "Marion", "Marshall", "Martin", "Miami", "Monroe", "Montgomery", "Morgan", "Newton",
    "Noble", "Ohio", "Orange", "Owen", "Parke", "Perry", "Pike", "Porter", "Posey",
    "Pulaski", "Putnam", "Randolph", "Ripley", "Rush", "St. Joseph", "St Joseph",
    "Saint Joseph", "Scott", "Shelby",
    "Spencer", "Starke", "Steuben", "Sullivan", "Switzerland", "Tippecanoe", "Tipton",
    "Union", "Vanderburgh", "Vermillion", "Vigo", "Wabash", "Warren", "Warrick",
    "Washington", "Wayne", "Wells", "White", "Whitley"
]
const indianaCities = [ 
    "Bloomington", "Evansville", "Fort Wayne", "Gary",
    "Indianapolis", "Kokomo", "Lafayette", "Marion", "Muncie", "New Albany", 
    "South Bend", "Terre Haute"
]
const iowaCounties = [ 
    "Adair", "Adams", "Allamakee", "Appanoose", "Audubon", "Benton", "Black Hawk", "Boone", "Bremer",
    "Buchanan", "Buena Vista", "Butler", "Calhoun", "Carroll", "Cass", "Cedar", "Carro Gordo",
    "Cherokee", "Chickasaw", "Clarke", "Clay", "Clayton", "Clinton", "Crawford", "Dallas", "Davis",
    "Decatur", "Delaware", "Des Moines", "Dickinson", "Dubuque", "Emmet", "Fayette", "Floyd", "Franklin",
    "Fremont", "Greene", "Grundy", "Guthrie", "Hamilton", "Hancock", "Hardin", "Harrison", "Henry",
    "Howard", "Humboldt", "Ida", "Iowa", "Jackson", "Jasper", "Jefferson", "Johnson", "Jones", "Keokuk",
    "Kossuth", "Lee", "Linn", "Louisa", "Lucas", "Lyon", "Madison", "Mahaska", "Marion", "Marshall",
    "Mills", "Mitchell", "Monona", "Monroe", "Montgomery", "Muscatine", "O'Brien", "Osceola", "Page",
    "Palo Alto", "Plymouth", "Pocahontas", "Polk", "Pottawattamie", "Poweshiek", "Ringgold", "Sac",
    "Scott", "Shelby", "Sioux", "Story", "Tama", "Taylor", "Union", "Van Buren", "Wapello", "Warren",
    "Washington", "Wayne", "Webster", "Winnebago", "Winneshiek", "Woodbury", "Worth", "Wright"
]
const iowaCities = [ 
    "Ames", "Bettendorf", "Burlington", "Cedar Falls", "Cedar Rapids", "Council Bluffs", 
    "Davenport", "Des Moines", "Dubuque", "Fort Dodge", 
    "Iowa City", "Marshalltown", "Mason City", "Sioux City", "Waterloo"
]
const kansasCounties = [ 
    "Allen", "Anderson", "Atchison", "Barber", "Barton", "Bourbon", "Brown",
    "Butler", "Chase", "Chautauqua", "Cherokee", "Cheyenne", "Clark", "Clay", "Cloud",
    "Coffey", "Comanche", "Cowley", "Crawford", "Decatur", "Dickinson", "Doniphan",
    "Douglas", "Edwards", "Elk", "Ellis", "Ellsworth", "Finney", "Ford", "Franklin",
    "Geary", "Gove", "Graham", "Grant", "Gray", "Greeley", "Greenwood", "Hamilton",
    "Harper", "Harvey", "Haskell", "Hodgeman", "Jackson", "Jefferson", "Jewell", "Johnson",
    "Kearny", "Kingman", "Kiowa", "Labette", "Lane", "Leavenworth", "Lincoln", "Linn",
    "Logan", "Lyon", "Marion", "Marshall", "McPherson", "Meade", "Miami", "Mitchell",
    "Montgomery", "Morris", "Morton", "Nemaha", "Neosho", "Ness", "Norton", "Osage",
    "Osborne", "Ottawa", "Pawnee", "Phillips", "Pottawatomie", "Pratt", "Rawlins", "Reno",
    "Republic", "Rice", "Riley", "Rooks", "Rush", "Russell", "Saline", "Scott", "Sedgwick",
    "Seward", "Shawnee", "Sheridan", "Sherman", "Smith", "Stafford", "Stanton", "Stevens",
    "Sumner", "Thomas", "Trego", "Wabaunsee", "Wallace", "Washington", "Wichita", "Wilson",
    "Woodson", "Wyandotte"
]
const kansasCities = [ 
    "Kansas City", "Lawrence", "Olathe", "Overland Park", "Topeka", "Wichita"
]
const kentuckyCounties = [ 
    "Adair", "Allen", "Anderson", "Ballard", "Barren", "Bath", "Bell", "Boone", "Bourbon",
    "Boyd", "Boyle", "Bracken", "Breathitt", "Breckinridge", "Bullitt", "Butler", "Caldwell",
    "Calloway", "Campbell", "Carlisle", "Carroll", "Carter", "Casey", "Christian", "Clark",
    "Clay", "Clinton", "Crittenden", "Cumberland", "Daviess", "Edmonson", "Elliott", "Estill",
    "Fayette", "Fleming", "Floyd", "Franklin", "Fulton", "Gallatin", "Garrard", "Grant",
    "Graves", "Grayson", "Green", "Greenup", "Hancock", "Hardin", "Harlan", "Harrison", "Hart",
    "Henderson", "Henry", "Hickman", "Hopkins", "Jackson", "Jefferson", "Jessamine", "Johnson",
    "Kenton", "Knott", "Knox", "LaRue", "Laurel", "Lawrence", "Lee", "Leslie", "Letcher",
    "Lewis", "Lincoln", "Livingston", "Logan", "Lyon", "McCracken", "McCreary", "McLean",
    "Madison", "Magoffin", "Marion", "Marshall", "Martin", "Mason", "Meade", "Menifee",
    "Mercer", "Metcalfe", "Monroe", "Montgomery", "Morgan", "Muhlenberg", "Nelson", "Nicholas",
    "Ohio", "Oldham", "Owen", "Owsley", "Pendleton", "Perry", "Pike", "Powell", "Pulaski",
    "Robertson", "Rockcastle", "Rowan", "Russell", "Scott", "Shelby", "Simpson", "Spencer",
    "Taylor", "Todd", "Trigg", "Trimble", "Union", "Warren", "Washington", "Wayne", "Webster",
    "Whitley", "Wolfe", "Woodford"
]
const kentuckyCities = [ 
    "Bowling Green", "Danville", "Frankfurt", "Georgetown", "Lexington", "Louisville", "Peducha",
    "Richmond"
]
const louisianaCounties = [ 
    "Acadia", "Allen", "Ascension", "Assumption", "Avoyelles", "Beauregard", "Bienville", "Bossier",
    "Caddo", "Calcasieu", "Caldwell", "Cameron", "Catahoula", "Concordia", "DeSoto", "East Baton Rouge",
    "East Carroll", "East Feliciana", "Evangeline", "Franklin", "Grant", "Iberia", "Iberville", "Jackson",
    "Jefferson", "Jefferson Davis", "Lafayette", "Lafourche", "LaSalle", "Lincoln", "Livingston", "Madison",
    "Morehouse", "Natchitoches", "Orleans", "Ouachita", "Plaquemines", "Pointe Coupee", "Rapides", "Red River",
    "Richland", "Sabine", "St Bernard", "St. Bernard", "Saint Bernard", "St Charles", "St. Charles", "Saint Charles",
    "St Helena", "St. Helena", "Saint Helena", "St James", "St. James", "Saint James", "St John the Baptist",
    "St. John the Baptist", "Saint John the Baptist", "St Landry", "St. Landry", "Saint Landry", "St Martin",
    "St. Martin", "Saint Martin", "St Mary", "St. Mary", "Saint Mary", "St Tammany", "St. Tammany", "Saint Tammany",
    "Tangipahoa", "Tensas", "Terrebonne", "Union", "Vermilion", "Vernon", "Washington", "Webster",
    "West Baton Rouge", "West Carroll", "West Feliciana", "Winn"
]
const louisianaCities = [ 
    "Alexandria", "Baton Rouge", "Bossier City", "Houma", "Kenner", "Lafayette", "Lake Charles",
    "Monroe", "New Iberia", "New Orleans", "Shreveport", "Slidell"
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
const maineCounties = [ 
    "Androscoggin", "Aroostook", "Cumberland", "Franklin", "Hancock", "Kennebec", "Knox",
    "Lincoln", "Oxford", "Penobscot", "Piscataquis", "Sagadahoc", "Somerset", "Waldo",
    "Washington", "York"
]
const maineCities = [ 
    "Augusta", "Bangor", "Freeport", "Kennebunkport", "Lewiston", "Portland"
]
const massachusettsCounties = [ 
    "Barnstable", "Berkshire", "Bristol", "Dukes", "Essex", "Franklin", "Hampden", "Hampshire",
    "Middlesex", "Nantucket", "Norfolk", "Plymouth", "Suffolk", "Worcester"
]
const massachusettsCities = [ 
    "Boston", "Cambridge", "Lowell", "Springfield", "Worcester", "West Springfield"
]
const michiganCounties = [ 
    "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga", "Barry", "Bay",
    "Benzie", "Barrien", "Branch", "Calhoun", "Cass", "Charlevoix", "Cheboygan", "Chippewa",
    "Clare", "Clinton", "Crawford", "Delta", "Dickinson", "Eaton", "Emmet", "Genesee",
    "Gladwn", "Gogebic", "Grand Traverse", "Gratiot", "Hillsdale", "Houghton", "Huron",
    "Ingham", "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo", "Kalkaska",
    "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston", "Luce",
    "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta", "Menominee",
    "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency", "Muskegon", "Newaygo",
    "Oakland", "Oceana", "Ogemaw", "Ontonagon", "Osceola", "Oscoda", "Otsego", "Ottawa",
    "Presque Isle", "Roscommon", "Saginaw", "Saint Clair", "St Clair", "St. Clair",
    "Saint Joseph", "St Joseph", "St. Joseph", "Sanilac", 
    "Schoolcraft", "Shiawassee", "Tuscola", "Van Buren", "Washtenaw", "Wayne"
]
const michiganCities = [ 
    "Ann Arbor", "Dearborn", "Detroit", "East Lansing", "Kalamazoo", "Lansing", "Saginaw"
]
const minnesotaCounties = [ 
    "Adkin", "Anoka", "Becker", "Beltrami", "Benton", "Big Stone", "Blue Earth", "Brown",
    "Carlton", "Carver", "Cass", "Chippewa", "Chisago", "Clay", "Clearwater", "Cook",
    "Cottonwood", "Crow", "Dakota", "Dodge", "Douglas", "Faribault", "Fillmore", "Freeborn",
    "Goodhue", "Grant", "Hennepin", "Houston", "Hubbard", "Isanti", "Itasca", "Jackson",
    "Kanabec", "Kandiyohi", "Kittson", "Koochiching", "Lac qui Parie", "Lake", "Lake of the Woods",
    "Le Sueur", "Lincoln", "Lyon", "McLeod", "Mahnomen", "Marshall", "Martin", "Meeker",
    "Mille Lacs", "Morrison", "Mower", "Murray", "Nicollet", "Nobles", "Norman", "Olmsted",
    "Otter Tail", "Pennington", "Pine", "Pipestone", "Polk", "Pope", "Ramsey", "Red Lake",
    "Redwood", "Renville", "Rice", "Rock", "Roseau", "Saint Louis", "St. Louis", "St Louis",
    "Scott",
    "Sherburne", "Sibley", "Stearns", "Steele", "Stevens", "Swift", "Todd", "Traverse",
    "Wabasha", "Wadena", "Waseca", "Washington", "Watonwan", "Wilkin", "Winona", "Wright",
    "Yellow Medicine"
]
const minnesotaCities = [ 
    "Duluth", "Minneapolis", "Rochester", "St. Cloud", "St Cloud", "Saint Cloud", 
    "St. Paul", "St Paul", "Saint Paul"
]
const mississippiCounties = [ 
    "Adams", "Alcorn", "Amite", "Attala", "Benton", "Bolivar", "Calhoun", "Carroll", "Chickasaw",
    "Choctaw", "Claiborne", "Clarke", "Clay", "Coahoma", "Copiah", "Covington", "DeSoto", "Forrest",
    "Franklin", "George", "Greene", "Grenada", "Hancock", "Harrison", "Hinds", "Holmes", "Humphreys",
    "Issaquena", "Itawamba", "Jackson", "Jasper", "Jefferson", "Jefferson Davis", "Jones", "Kemper",
    "Lafayette", "Lamar", "Lauderdale", "Lawrence", "Leake", "Lee", "Leflore", "Lincoln", "Lowndes", 
    "Madison", "Marion", "Marshall", "Monroe", "Montgomery", "Neshoba", "Newton", "Noxubee", "Oktibbeha",
    "Panola", "Pearl River", "Perry", "Pike", "Pontotoc", "Prentiss", "Quitman", "Rankin", "Scott",
    "Sharkey", "Simpson", "Smith", "Stone", "Sunflower", "Tallahatchie", "Tate", "Tippah", "Tishomingo",
    "Tunica", "Union", "Walthall", "Warren", "Washington", "Wayne", "Webster", "Wilkinson", "Winston",
    "Yalobusha", "Yazoo"
]
const mississippiCities = [ 
    "Biloxi", "Clarksdale", "Cleveland", "Columbus", "Greenville", "Gulfport", "Hattiesburg", 
    "Indianola", "Jackson", "Meridian", "Oxford",
    "Tupelo", "Yazoo City"
]
const missouriCounties = [ 
    "Adair", "Andrew", "Atchison", "Audrain", "Barry", "Barton", "Bates", "Benton", "Bollinger",
    "Boone", "Buchanan", "Butler", "Caldwell", "Callaway", "Camden", "Cape Girardeau", "Carroll",
    "Carter", "Cass", "Cedar", "Chariton", "Christian", "Clark", "Clay", "Clinton", "Cole",
    "Cooper", "Crawford", "Dade", "Dallas", "Daviess", "DeKalb", "Dent", "Douglas", "Ducklin",
    "Franklin", "Gasconade", "Gentry", "Greene", "Grundy", "Harrison", "Henry", "Hickory",
    "Holt", "Howard", "Howell", "Iron", "Jackson", "Jasper", "Jefferson", "Johnson", "Knox",
    "Laclede", "Lafayette", "Lawrence", "Lewis", "Lincoln", "Linn", "Livingston", "Macon",
    "Madison", "Maries", "Marion", "McDonald", "Mercer", "Miller", "Mississippi", "Moniteau",
    "Monroe", "Montgomery", "Morgan", "New Madrid", "Newton", "Nodaway", "Oregon", "Osage",
    "Ozark", "Permiscot", "Perry", "Pettis", "Phelps", "Pike", "Platte", "Polk", "Pulaski",
    "Putnam", "Ralls", "Randolph", "Ray", "Reynolds", "Ripley", "Saint Charles", "St Charles",
    "St. Charles", "Saint Clair", "St Clair", "St. Clair", "Saint Francois", "St Francois",
    "St. Francois", "Saint Louis", "St Louis", "St. Louis", "Ste. Genevieve", "Saline", "Schuyler", "Scotland", "Scott",
    "Shannon", "Shelby", "Stoddard", "Stone", "Sullivan", "Taney", "Texas", "Vernon", "Warren",
    "Washington", "Wayne", "Webster", "Worth", "Wright"
]
const missouriCities = [ 
    "Independence", "Jefferson City", "Kansas City", "Lees Summit", "St. Louis", "Saint Louis",
    "St Louis", "Springfield"
]
const montanaCounties = [ 
    "Beaverhead", "Big Horn", "Blaine", "Broadwater", "Carbon", "Carter", "Cascade", "Chouteau",
    "Custer", "Daniels", "Dawson", "Deer Lodge", "Fallon", "Fergus", "Flathead", "Gallatin",
    "Garfield", "Glacier", "Golden Valley", "Granite", "Hill", "Jefferson", "Judith Basin",
    "Lake", "Lewis and Clark", "Liberty", "McCone", "Madison", "Meagher", "Mineral", "Missoula",
    "Musselshell", "Park", "Petroleum", "Phillips", "Pondera", "Powder River", "Powell", "Prairie",
    "Ravalli", "Richland", "Roosevelt", "Rosebud", "Sanders", "Sheridan", "Silver Bow",
    "Stillwater", "Sweet Grass", "Teton", "Toole", "Treasure", "Valley", "Wheatland", "Wibaux",
    "Yellowstone"
]
const montanaCities = [ 
    "Billings", "Bozeman", "Butte", "Great Falls", "Helena", "Missoula"
]
const nebraskaCounties = [ 
    "Adams", "Antelope", "Arthur", "Banner", "Blaine", "Box Butte", "Boyd", "Brown", "Buffalo", "Burt",
    "Butler", "Cass", "Cedar", "Chase", "Cherry", "Cheyenne", "Clay", "Colfax", "Cuming", "Custer",
    "Dakota", "Dawes", "Dawson", "Deuel", "Dixon", "Dodge", "Douglas", "Dundy", "Fillmore", "Franklin",
    "Frontier", "Furnas", "Gage", "Garden", "Garfield", "Gosper", "Grant", "Greeley", "Hall", "Hamilton",
    "Harlan", "Hayes", "Hitchcock", "Holt", "Hooker", "Howard", "Jefferson", "Johnson", "Kearney", "Keith",
    "Keya Paha", "Kimball", "Knox", "Lancaster", "Lincoln", "Logan", "Loup", "Madison", "McPherson", "Merrick",
    "Morrill", "Nance", "Nemaha", "Nuckolls", "Otoe", "Pawnee", "Perkins", "Phelps", "Pierce", "Platte",
    "Polk", "Red Willow", "Richardson", "Rock", "Salina", "Sarpy", "Saunders", "Scotts Bluff", "Seward",
    "Sheridan", "Sherman", "Sioux", "Stanton", "Thayer", "Thomas", "Thurston", "Valley", "Washington",
    "Wayne", "Webster", "Wheeler", "York"
]
const nebraskaCities = [ 
    "Beatrice", "Columbus", "Fremont", "Grand Island", "Kearney", "La Vista", "Lincoln",
    "North Platte", "Omaha", "Scottsbluff"
]
const newHampshireCounties = [ 
    "Belknap", "Carroll", "Cheshire", "Coos", "Grafton", "Hillsborough", "Merrimack",
    "Rockingham", "Strafford", "Sullivan"
]
const newHampshireCities = [ 
    "Concord", "Manchester", "Nashua", "Portsmouth"
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
const nevadaCounties = [
    "Carson City", "Churchill", "Clark", "Douglas", "Elko", "Esmeralda", "Eureka",
    "Humboldt", "Lander", "Lincoln", "Lyon", "Mineral", "Nye", "Pershing", "Storey",
    "Washoe", "White Pine"
]
const nevadaCities = [
    "Las Vegas", "Reno"
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
    "Richmond", "Robeson", "Rockingham", "Rowan", "Rutherford", "Sampson",
    "Scotland", "Stanly", "Stokes", "Surry", "Swain", "Transylvania", "Tyrrell",
    "Union", "Vance", "Wake", "Warren", "Washington", "Watauga", "Wayne", "Wilkes",
    "Wilson", "Yadkin", "Yancey"
]
const northCarolinaCities = [
    "Asheville", "Boone", "Burlington",
    "Cary", "Chapel Hill", "Charlotte", "Durham", "Fayetteville", "Greensboro",
    "Greenville", "High Point", "Jacksonville", "New Bern",
    "Raleigh", "Research Triangle Park", "RTP", "Roanoke Rapids",
    "Wilmington", "Wilson", "Winston Salem",
    "Winston-Salem"
]
const northDakotaCounties = [
    "Adams", "Barnes", "Benson", "Billings", "Bottineau", "Bowman", "Burke", "Burleigh", "Cass",
    "Cavalier", "Dickey", "Divide", "Dunn", "Eddy", "Emmons", "Foster", "Golden Valley", "Grand Forks",
    "Grant", "Griggs", "Hettinger", "Kidder", "LaMoure", "Logan", "McHenry", "McIntosh", "McKenzie",
    "McLean", "Mercer", "Morton", "Mountrail", "Nelson", "Oliver", "Pembina", "Pierce", "Ramsay",
    "Ransom", "Renville", "Richland", "Rolette", "Sargent", "Sheridan", "Sioux", "Slope", "Stark",
    "Steele", "Stutsman", "Towner", "Traill", "Walsh", "Ward", "Wells", "Williams"
]
const northDakotaCities = [
    "Bismark", "Fargo", "Grand Forks", "McClusky", "Minot"
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
const oklahomaCounties = [
    "Adair", "Alfalfa", "Atoka", "Beaver", "Beckham", "Blaine", "Bryan", "Caddo",
    "Canadian", "Carter", "Cherokee", "Choctaw", "Cimarron", "Cleveland", "Coal", "Comanche",
    "Cotton", "Craig", "Creek", "Custer", "Delaware", "Dewey", "Ellis", "Garfield",
    "Garvin", "Grady", "Grant", "Greer", "Harmon", "Harper", "Haskell", "Hughes",
    "Jackson", "Jefferson", "Johnston", "Kay", "Kingfisher", "Kiowa", "Latimer",
    "La Flore", "Lincoln", "Logan", "Love", "Major", "Marshall", "Mayes", "McClain",
    "McCurtain", "McIntosh", "Murray", "Muskogee", "Noble", "Nowata", "Okfuskee",
    "Oklahoma", "Okmulgee", "Osage", "Ottawa", "Pawnee", "Payne", "Pittsburg", "Pontotoc",
    "Pottawatomie", "Pushmataha", "Roger Mills", "Rogers", "Seminole", "Sequoyah", "Stephens",
    "Texas", "Tillman", "Tulsa", "Wagoner", "Washington", "Washita", "Woods", "Woodward"
]
const oklahomaCities = [
    "Oklahoma City", "Stillwater", "Tulsa"
]
const oregonCounties = [
    "Baker", "Benton", "Clackamas", "Clatsop", "Columbia", "Coos", "Crook", "Curry",
    "Deschutes", "Douglas", "Gilliam", "Grant", "Harney", "Hood River", "Jackson",
    "Jefferson", "Josephine", "Klamath", "Lake", "Lane", "Lincoln", "Linn", "Malheur",
    "Marion", "Morrow", "Multnomah", "Polk", "Sherman", "Tillamook", "Umatilla", "Union",
    "Wallowa", "Wasco", "Washington", "Wheeler", "Yamhill"
]
const oregonCities = [
    "Corvallis", "Eugene", "Hillsboro", "Medford", "Portland", "Salem"
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
const puertoRicoCounties = [
    "Aguadilla", "Isabela", "Quebradillas", "Camuy", "Hatillo", "Arecibo", "Barceloneta", "Florida",
    "Manati", "Vega Baja", "Vega Alta", "Dorado", "Toa Baja", "Catano", "Bayamon", "Guaynabo", "San Juan",
    "Trujillo Alto", "Carolina", "Loiza", "Canovanas", "Rio Grande", "Luquillo", "Fajardo", "Rincon",
    "Aguada", "Moca", "San Sebastian", "Lares", "Utuado", "Ciales", "Morovis", "Corozal", "Toa Alta",
    "Naranjito", "Aguas Buenas", "Caguas", "Gurabo", "Juncos", "Las Piedras", "Naguabo", "Ceiba", "Anasco",
    "Mayaguez", "Las Marias", "Maricao", "Adjuntas", "Jayuya", "Orocovis", "Barranquitas", "Comerio",
    "Cidra", "San Lorenzo", "Humacao", "Cabo Rojo", "Hormigueros", "San German", "Sabana Grande", "Lajas",
    "Guanica", "Yauco", "Guayanilla", "Penuelas", "Ponce", "Juana Diaz", "Villalba", "Coamo", "Aibonito",
    "Cayey", "Santa Isabel", "Salinas", "Guayama", "Arroyo", "Patillas", "Maunabo", "Yabucoa", "Vieques",
    "Culebra"
]
const puertoRicoCities = [
    "Adjuntas", "Aguada", "Arecibo", "Aguadilla", "Carolina", "Guayama", "Humacao", "Juncos", "Mayoguez",
    "Ponce", "San Juan", "San German", "San Sebastian", "Santa Isabel", "Utuado", "Yauco"
]
const rhodeIslandCounties = [
    "Bristol", "Kent", "Newport", "Providence", "Washington"
]
const rhodeIslandCities = [
    "Bristol", "Newport", "Providence"
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
const southDakotaCounties = [
    "Aurora", "Beadle", "Bennett", "Bon Homme", "Brookings", "Brown", "Brule", "Buffalo", "Butte",
    "Campbell", "Charles Mix", "Clark", "Clay", "Codington", "Corson", "Custer", "Davison", "Day",
    "Deuel", "Dewey", "Douglas", "Edmunds", "Fall River", "Faulk", "Grant", "Gregory", "Haakon",
    "Hamlin", "Hand", "Hanson", "Harding", "Hughes", "Hutchinson", "Hyde", "Jackson", "Jerauld",
    "Jones", "Kingsbury", "Lake", "Lawrence", "Lincoln", "Lyman", "Marshall", "McCook", "McPherson",
    "Meade", "Mellette", "Miner", "Minnehaha", "Moody", "Oglala Lakota", "Pennington", "Perkins",
    "Potter", "Roberts", "Sanborn", "Spink", "Stanley", "Sully", "Todd", "Tripp", "Turner", "Union",
    "Walworth", "Yankton", "Ziebach"
]
const southDakotaCities = [
    "Fort Pierre", "Pierre", "Sioux Falls"
]
const tennesseeCounties = [
    "Anderson", "Bedford", "Benton", "Bledsoe", "Blount", "Bradley", "Campbell", "Cannon", "Carroll",
    "Carter", "Cheatham", "Chester", "Claiborne", "Clay", "Cocke", "Coffee", "Crockett", "Cumberland",
    "Davidson", "Decatur", "DeKalb", "Dickson", "Dyer", "Fayette", "Fentress", "Franklin", "Gibson",
    "Giles", "Grainger", "Greene", "Grundy", "Hamblen", "Hamilton", "Hancock", "Hardeman", "Hardin",
    "Hawkins", "Haywood", "Henderson", "Henry", "Hickman", "Houston", "Humphreys", "Jackson", "Jefferson",
    "Johnson", "Knox", "Lake", "Lauderdale", "Lawrence", "Lewis", "Lincoln", "Loudon", "Macon", "Marion",
    "Marshall", "Maury", "McMinn", "McNairy", "Meigs", "Monroe", "Montgomery", "Moore", "Morgan", "Obion",
    "Overton", "Perry", "Pickett", "Polk", "Putnam", "Rhea", "Roane", "Robertson", "Rutherford", "Scott",
    "Sequatchie", "Sevier", "Shelby", "Smith", "Stewart", "Sullivan", "Sumner", "Tipton", "Trousdale",
    "Union", "Van Buren", "Warren", "Washington", "Wayne", "Weakley", "Williamson", "Wilson"
]
const tennesseeCities = [
    "Chattanooga", "Knoxville", "Lebanon", "Memphis", "Murfreesboro", "Nashville", "Sevierville"
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
const vermontCounties = [ 
    "Addison", "Bennington", "Caledonia", "Chittenden", "Essex", "Franklin", "Grand Isle", "Lamoille",
    "Orange", "Orleans", "Rutland", "Washington", "Windham", "Windsor"
]
const vermontCities = [ 
    "Barre", "Burlington", "Essex Junction", "Manchester", "Newport",
    "Rutland", "St Albans", "St. Albans", "Saint Albans", "St Johnsbury", "St. Johnsbury", "Saint Johnsbury", 
    "Springfield", "Winooski"
]

const virginIslandsCities = [
    "Charlotte Amalie", "Christiansted", "Cruz Bay", "Frederiksted", "Southwest Cape"
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
    "Alexandria", "Arlington", "Blacksburg", "Charlottesville", "Chesapeake", "Danville",
    "Fairfax", "Falls Church", "Hampton", "Harrisonburg", "Herndon", "Lynchburg", "Manassas",
    "Newport News", "Norfolk", "Reston", "Richmond", "Roanoke", "Virginia Beach"
]
const washingtonCounties = [
    "Adams", "Asotin", "Benton", "Chelan", "Clallam", "Clark", "Columbia", "Cowlitz", "Douglas",
    "Ferry", "Franklin", "Garfield", "Grant", "Grays Harbor", "Island", "Jefferson", "King",
    "Kitsap", "Kittitas", "Klickitat", "Lewis", "Lincoln", "Mason", "Okanogan", "Pacific",
    "Pend Oreille", "Pierce", "San Juan", "Skagit", "Skamania", "Snohomish", "Spokane",
    "Stevens", "Thurston", "Wahkiakum", "Walla Walla", "Whatcom", "Whitman", "Yakima"
]
const washingtonCities = [
    "Bellevue", "Bellingham", "Centralia", "Everett", "Kent", "Kirkland", "Mount Vernon", "Mt. Vernon", "Mt Vernon",
    "Port Angeles", "Pullman",
    "Seattle", "Spokane", "Tacoma", "Walla Walla", "Yakima"
]
const westVirginaCounties = [
    "Barbour", "Berkeley", "Boone", "Braxton", "Brooke", "Cabell", "Calhoun", "Clay", "Doddridge",
    "Fayette", "Gilmer", "Grant", "Greenbrier", "Hampshire", "Hancock", "Hardy", "Harrison",
    "Jackson", "Jefferson", "Kanawha", "Lewis", "Lincoln", "Logan", "Marion", "Marshall",
    "Mason", "McDowell", "Mercer", "Mineral", "Mingo", "Monongalia", "Monroe", "Morgan",
    "Nicholas", "Ohio", "Pendleton", "Pleasants", "Pocahontas", "Preston", "Putnam", "Raleigh",
    "Randolph", "Ritchie", "Roane", "Summers", "Taylor", "Tucker", "Tyler", "Upshur", "Wayne",
    "Webster", "Wetzel", "Wirt", "Wood", "Wyoming"
]
const westVirginaCities = [
    "Beckley", "Charleston", "Fayetteville", "Huntington", "Morgantown", "Wheeling"
]
const wisconsinCounties = [
    "Adams", "Ashland", "Barron", "Bayfield", "Brown", "Buffalo", "Burnett", "Calumet", "Chippewa",
    "Clark", "Columbia", "Crawford", "Dane", "Dodge", "Door", "Douglas", "Dunn", "Eau Claire",
    "Florence", "Fond du Lac", "Forest", "Grant", "Green", "Green Lake", "Iowa", "Iron", "Jackson", 
    "Jefferson", "Juneau", "Kenosha", "Kewaunee", "La Crosse", "Lafayette", "Landglade", "Lincoln",
    "Manitowoc", "Marathon", "Marinette", "Marquette", "Menominee", "Milwaukee", "Monroe", "Oconto",
    "Oneida", "Outagamie", "Ozaukee", "Pepin", "Pierce", "Polk", "Portage", "Price", "Racine", 
    "Richland", "Rock", "Rusk", "Sauk", "Sawyer", "Shawano", "Sheboygan", "St Croix", "St. Croix",
    "Saint Croix", "Taylor", "Trempealeau", "Vernon", "Vilas", "Walworth", "Washburn", "Washington",
    "Waukesha", "Waupaca", "Waushara", "Winnebago", "Wood"
]
const wisconsinCities = [
    "Appleton", "Eau Claire", "Fond du Lac", "Green Bay", "Janesville", "Kenosha", "Le Crosse",
    "Madison", "Milwaukee", "Oshkosh", "Racine", "Sheboygan", "Waukesha", "West Bend"
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
     congressionalDistricts: 7
    }, 
    {id: "AR",
     summarizeType: "FULL",
     counties: arkansasCounties,
     cities: arkansasCities,
     congressionalDistricts: 4
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
     congressionalDistricts: 5
    }, 
    {id: "DC",
     summarizeType: "FULL",
     cities: dcCities,
     congressionalDistricts: 1
    }, 
    {id: "DE",
     summarizeType: "FULL",
     counties: delawareCounties,
     cities: delawareCities,
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
    {id: "GU",
     summarizeType: "FULL",
     cities: guamCities
    }, 
    {id: "HI",
     summarizeType: "FULL",
     counties: hawaiiCounties,
     cities: hawaiiCities,
     congressionalDistricts: 2
    }, 
    {id: "ID",
     summarizeType: "FULL",
     counties: idahoCounties,
     cities: idahoCities,
     congressionalDistricts: 2
    }, 
    {id: "IL",
     summarizeType: "FULL",
     counties: illinoisCounties,
     cities: illinoisCities,
     congressionalDistricts: 18
    }, 
    {id: "IN",
     summarizeType: "FULL",
     counties: indianaCounties,
     cities: indianaCities,
     congressionalDistricts: 9
    }, 
    {id: "IO",
     summarizeType: "FULL",
     counties: iowaCounties,
     cities: iowaCities,
     congressionalDistricts: 4
    }, 
    {id: "KS",
     summarizeType: "FULL",
     counties: kansasCounties,
     cities: kansasCities,
     congressionalDistricts: 4
    }, 
    {id: "KY",
     summarizeType: "FULL",
     counties: kentuckyCounties,
     cities: kentuckyCities,
     congressionalDistricts: 6
    }, 
    {id: "LA",
     summarizeType: "FULL",
     counties: louisianaCounties,
     cities: louisianaCities,
     congressionalDistricts: 6
    }, 
    {id: "MA",
     summarizeType: "FULL",
     counties: massachusettsCounties,
     cities: massachusettsCities,
     congressionalDistricts: 9
    }, 
    {id: "MD",
     summarizeType: "FULL",
     counties: marylandCounties,
     cities: marylandCities,
     congressionalDistricts: 8
    }, 
    {id: "ME",
     counties: maineCounties,
     cities: maineCities,
     summarizeType: "FULL",
     congressionalDistricts: 2
    }, 
    {id: "MI",
     summarizeType: "FULL",
     counties: michiganCounties,
     cities: michiganCities,
     congressionalDistricts: 14
    }, 
    {id: "MN",
     summarizeType: "FULL",
     counties: minnesotaCounties,
     cities: minnesotaCities,
     congressionalDistricts: 8
    }, 
    {id: "MO",
     summarizeType: "FULL",
     counties: missouriCounties,
     cities: missouriCities,
     congressionalDistricts: 8
    }, 
    {id: "MS",
     summarizeType: "FULL",
     counties: mississippiCounties,
     cities: mississippiCities,
     congressionalDistricts: 4
    }, 
    {id: "MT",
     summarizeType: "FULL",
     counties: montanaCounties,
     cities: montanaCities,
     congressionalDistricts: 1
    }, 
    {id: "NC",
     summarizeType: "FULL",
     counties: northCarolinaCounties,
     cities: northCarolinaCities,
     congressionalDistricts: 13
    }, 
    {id: "ND",
     summarizeType: "FULL",
     counties: northDakotaCounties,
     cities: northDakotaCities,
     congressionalDistricts: 1
    }, 
    {id: "NE",
     summarizeType: "FULL",
     counties: nebraskaCounties,
     cities: nebraskaCities,
     congressionalDistricts: 3
    }, 
    {id: "NH",
     summarizeType: "FULL",
     counties: newHampshireCounties,
     cities: newHampshireCities,
     congressionalDistricts: 2
    }, 
    {id: "NJ",
     summarizeType: "BRIEF",
     counties: newJerseyCounties,
     cities: newJerseyCities,
     congressionalDistricts: 12
    }, 
    {id: "NM",
     counties: newMexicoCounties,
     cities: newMexicoCities,
     summarizeType: "FULL",
     congressionalDistricts: 3
    }, 
    {id: "NV",
     summarizeType: "FULL",
     counties: nevadaCounties,
     cities: nevadaCities,
     congressionalDistricts: 4
    }, 
    {id: "NY",
     summarizeType: "BRIEF",
     counties: newYorkCounties,
     cities: newYorkCities,
     congressionalDistricts: 27
    }, 
    {id: "OH",
     summarizeType: "FULL",
     counties: ohioCounties,
     cities: ohioCities,
     congressionalDistricts: 16
    }, 
    {id: "OK",
     summarizeType: "FULL",
     counties: oklahomaCounties,
     cities: oklahomaCities,
     congressionalDistricts: 5
    }, 
    {id: "OR",
     summarizeType: "FULL",
     counties: oregonCounties,
     cities: oregonCities,
     congressionalDistricts: 5
    }, 
    {id: "PA",
     summarizeType: "FULL",
     counties: pennsylvaniaCounties,
     cities: pennsylvaniaCities,
     congressionalDistricts: 18
    }, 
    {id: "PR",
     counties: puertoRicoCounties,
     cities: puertoRicoCities,
     summarizeType: "FULL"
    }, 
    {id: "RI",
     summarizeType: "FULL",
     counties: rhodeIslandCounties,
     cities: rhodeIslandCities,
     congressionalDistricts: 2
    }, 
    {id: "SC",
     summarizeType: "FULL",
     counties: southCarolinaCounties,
     cities: southCarolinaCities,
     congressionalDistricts: 7
    }, 
    {id: "SD",
     summarizeType: "FULL",
     counties: southDakotaCounties,
     cities: southDakotaCities,
     congressionalDistricts: 3
    }, 
    {id: "TN",
     summarizeType: "FULL",
     counties: tennesseeCounties,
     cities: tennesseeCities,
     congressionalDistricts: 9
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
    {id: "VI",
     summarizeType: "FULL",
     cities: virginIslandsCities
    }, 
    {id: "VT",
     summarizeType: "FULL",
     counties: vermontCounties,
     cities: vermontCities,
     congressionalDistricts: 1
    }, 
    {id: "WA",
     summarizeType: "FULL",
     counties: washingtonCounties,
     cities: washingtonCities,
     congressionalDistricts: 10
    }, 
    {id: "WV",
     summarizeType: "FULL",
     counties: westVirginaCounties,
     cities: westVirginaCities,
     congressionalDistricts: 3
    }, 
    {id: "WI",
     summarizeType: "FULL",
     counties: wisconsinCounties,
     cities: wisconsinCities,
     congressionalDistricts: 8
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
    }
    logger.trace(chalk.bgBlue('End of method'))
    return Promise.resolve
}
const processYears = (async () => {
    const beginTime = moment()
    logger.info(chalk.bgRed.white.bold(`Initialize: ${beginTime.format('MMMM Do YYYY, h:mm:ss A')}`));
    try{
        await asyncForEach(years, async(year) => {
            logger.info("Process Year: " + year)
            currentYear = year
            try{
                await processStates(year)
            }catch(e){
                logger.error(chalk.bgRed(`Processing ${year} failed: ` + e))
                logger.error(chalk.bgRed('Continuning to other years.'))
            }
            const timeUnits = 'hours'
            var duration = moment().diff(beginTime, timeUnits, true)
            logger.info(chalk.bgHex('#880066').white.bold(`Elapsed Time: ${duration.toFixed(2)} ${timeUnits}`))               
        })
    }catch(e){
        logger.error(chalk.bgRed('Process Years FAILED: ' + e))
        // return Promise.reject(e)
    }
    logger.info(chalk.bgBlue('End of building summaries'))
    return Promise.resolve
})

const bldSummaries = async () => {

    logger.info('Build summaries');
    // start()
    await processYears()

    setTimeout( () => {
        log("Timer expired")
    }, 0)
    logger.info(chalk.bgRed.bold("Build complete"))
    process.exit()
}

const cb = (obj) => {
    // logger.info(`System Info: ${JSON.stringify(obj)}`)
    logger.info(chalk.bgRed.white.bold("Platform:") + ' ' + chalk.green.bold(obj.platform))
    logger.info(chalk.bgRed.white.bold("Hostname:") + ' ' + chalk.green.bold(obj.hostname))
}
si.osInfo(cb)

bldSummaries();

