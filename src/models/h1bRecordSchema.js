const mongoose = require('mongoose');

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
  WORKSITE_CONGRESS_DISTICT: {
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

module.exports = h1bRecordSchema;
