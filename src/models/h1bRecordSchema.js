const mongoose = require('mongoose');
const YEAR = "YEAR"
const CASE_NUMBER = "CASE_NUMBER"
const CASE_STATUS = "CASE_STATUS"
const WORKSITE_CONGRESS_DISTRICT = "WORKSITE_CONGRESS_DISTICT"
const EMPLOYER_NAME = "EMPLOYER_NAME"
const WORKSITE_ADDR1 = "WORKSITE_ADDR1"
const WORKSITE_ADDR2 = "WORKSITE_ADDR2"
const WORKSITE_CITY = "WORKSITE_CITY"
const WORKSITE_COUNTY = "WORKSITE_COUNTY"
const WORKSITE_STATE = 'WORKSITE_STATE'
const WORKSITE_LATITUDE = 'WORKSITE_LATITUDE'
const WORKSITE_LONGITUDE = 'WORKSITE_LONGITUDE'
const WAGE_LEVEL = "WAGE_LEVEL"
const TOTAL_WORKERS = "TOTAL_WORKERS"
const TOTAL_LCAS = "TOTAL_LCAS"
const ANNUALIZED_WAGE_RATE_OF_PAY = "ANNUALIZED_WAGE_RATE_OF_PAY"
const ANNUALIZED_PREVAILING_WAGE = "ANNUALIZED_PREVAILING_WAGE"
const SOC_CODE = "SOC_CODE"

const LEVEL_1 = "Level I"
const LEVEL_2 = "Level II"
const LEVEL_3 = "Level III"
const LEVEL_4 = "Level IV"
const UNSPECIFIED = "Level Unspecified"

const H1B_DEPENDENT = "H1B_DEPENDENT"
const NEW_EMPLOYMENT = "NEW_EMPLOYMENT"
const CONTINUED_EMPLOYMENT = "CONTINUED_EMPLOYMENT"
const CHANGE_PREVIOUS_EMPLOYMENT = "CHANGE_PREVIOUS_EMPLOYMENT"
const NEW_CONCURRENT_EMPLOYMENT = "NEW_CONCURRENT_EMPLOYMENT"
const CHANGE_EMPLOYER = "CHANGE_EMPLOYER"
const AMENDED_PETITION = "AMENDED_PETITION"

percentileLevels = [0, .1, .25, .5, .75, .9, 1]

// H1B Record Schema
const h1bRecordSchema = mongoose.Schema({
  YEAR: {
    type: Number,
    index: true,
    // required: true
  },
	CASE_NUMBER: {
		type: String,
    // required: true
  },
	EIN_UNIQUE_ID: {
		type: String,
    // required: true
	},
	CASE_STATUS: {
		type: String,
    // required: true,
	},
	VISA_CLASS: {
		type: String,
    // required: true
	},
  WAGE_LEVEL: {
    type: String,
    // required: true
  },
	JOB_TITLE: {
		type: String,
	},
	H1B_DEPENDENT: {
		type: String,
	},
  WILLFUL_VIOLATOR: {
    type: String,
  },
  TOTAL_WORKERS: {
    type: Number,
    default: 0
  },
  CASE_SUBMITTED: {
    type: Number,
    default: 0
  },
  DECISION_DATE: {
    type: Number,
    default: 0
  },
  EMPLOYMENT_START_DATE: {
    type: Number,
    default: 0
  },
  EMPLOYMENT_END_DATE: {
    type: Number,
    default: 0
  },
  HIRING_DELAY: {
    type: Number,
    default: 0
  },
  EMPLOYER_NAME: {
    type: String,
    default: ""
  },
  EMPLOYER_ADDRESS: {
    type: String,
    default: ""
  },
  EMPLOYER_CITY: {
    type: String,
    default: ""
  },
  EMPLOYER_STATE: {
    type: String,
    default: ""
  },
  EMPLOYER_POSTAL_CODE: {
    type: String,
    default: ""
  },
  EMPLOYER_COUNTRY: {
    type: String,
    default: ""
  },
  EMPLOYER_PROVINCE: {
    type: String,
    default: ""
  },
  EMPLOYER_PHONE: {
    type: String,
    default: ""
  },
  EMPLOYER_PHONE_EXT: {
    type: String,
    default: ""
  },
  EMPLOYER_LATITUDE: {
    type: Number,
    default: ""
  },
  EMPLOYER_LONGITUDE: {
    type: Number,
    default: ""
  },
  EMPLOYER_CONGRESS_DISTICT: {
    type: Number,
    default: ""
  },
  EMPLOYER_MSA: {
    type: String,
    default: ""
  },
  WORKSITE_ADDR1: {
    type: String,
    default: ""
  },
  WORKSITE_ADDR2: {
    type: String,
    default: ""
  },
  WORKSITE_CITY: {
    type: String,
    default: ""
  },
  WORKSITE_COUNTY: {
    type: String,
    default: ""
  },
  WORKSITE_STATE: {
    type: String,
    default: ""
  },
  WORKSITE_POSTAL_CODE: {
    type: String,
    default: ""
  },
  WORKSITE_LATITUDE: {
    type: Number,
    default: ""
  },
  WORKSITE_LONGITUDE: {
    type: Number,
    default: ""
  },
  WORKSITE_CONGRESS_DISTRICT: {
    type: Number,
    default: ""
  },
  WORKSITE_MSA: {
    type: String,
    default: ""
  },
  AGENT_REPRESENTING_EMPLOYER: {
    type: String,
    default: ""
  },
  AGENT_ATTORNEY_NAME: {
    type: String,
    default: ""
  },
  AGENT_ATTORNEY_CITY: {
    type: String,
    default: ""
  },
  AGENT_ATTORNEY_STATE: {
    type: String,
    default: ""
  },
  SOC_CODE: {
    type: String,
    default: ""
  },
  SOC_NAME: {
    type: String,
    default: ""
  },
  NAICS_CODE: {
    type: String,
    default: ""
  },
  FULL_TIME_POSITION: {
    type: String,
    default: ""
  },
  PREVAILING_WAGE: {
    type: String,
    default: ""
  },
  PW_UNIT_OF_PAY: {
    type: String,
    default: ""
  },
  PW_SOURCE: {
    type: String,
    default: ""
  },
  PW_SOURCE_YEAR: {
    type: Number,
    default: 0
  },
  PW_SOURCE_OTHER: {
    type: String,
    default: ""
  },
  WAGE_RATE_OF_PAY_FROM: {
    type: String,
    default: ""
  },
  WAGE_RATE_OF_PAY_TO: {
    type: String,
    default: ""
  },
  WAGE_RATE_OF_PAY: {
    type: String,
    default: ""
  },
  WAGE_UNIT_OF_PAY: {
    type: String,
    default: ""
  },
  ANNUALIZED_PREVAILING_WAGE: {
    type: Number
  },
  ANNUALIZED_WAGE_RATE_OF_PAY: {
    type: Number
  },
  NEW_EMPLOYMENT: {
    type: Number,
    default: 0
  },
  CONTINUED_EMPLOYMENT: {
    type: Number,
    default: 0
  },
  CHANGE_PREVIOUS_EMPLOYMENT: {
    type: Number,
    default: 0
  },
  NEW_CONCURRENT_EMPLOYMENT: {
    type: Number,
    default: 0
  },
  CHANGE_EMPLOYER: {
    type: Number,
    default: 0
  },
  AMENDED_PETITION: {
    type: Number,
    default: 0
  },
  ORIGINAL_CERT_DATE: {
    type: String,
    default: ""
  },
  EMPLOYER_BUSINESS_DBA: {
    type: String,
    default: ""
  },
  SUPPORT_H1B: {
    type: String,
    default: ""
  },
  LABOR_CON_AGREE: {
    type: String,
    default: ""
  },
  PUBLIC_DISCLOSURE_LOCATION: {
    type: String,
    default: ""
  },
  WORKSITE_USG_STATE: {
    type: String,
    default: ""
  },
  EMPLOYER_USG_STATE: {
    type: String,
    default: ""
  }
});

module.exports = { YEAR,
  CASE_NUMBER,
  CASE_STATUS,
  WAGE_LEVEL,
  TOTAL_WORKERS,
  TOTAL_LCAS,
  EMPLOYER_NAME,
  WORKSITE_CONGRESS_DISTRICT,
  WORKSITE_ADDR1,
  WORKSITE_ADDR2,
  WORKSITE_CITY,
  WORKSITE_COUNTY,
  WORKSITE_STATE,
  WORKSITE_LATITUDE,
  WORKSITE_LONGITUDE,
  SOC_CODE,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  UNSPECIFIED,
  H1B_DEPENDENT,
  NEW_EMPLOYMENT,
  CONTINUED_EMPLOYMENT,
  CHANGE_PREVIOUS_EMPLOYMENT,
  NEW_CONCURRENT_EMPLOYMENT,
  CHANGE_EMPLOYER,
  AMENDED_PETITION,
  ANNUALIZED_PREVAILING_WAGE,
  ANNUALIZED_WAGE_RATE_OF_PAY,
  percentileLevels,
  h1bRecordSchema
}
