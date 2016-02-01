import Promise from "bluebird";
import Commander from "commander";
import ExcelParser from "excel";
import CachingGeocoder from "./CachingGeocoder";
import Timezone from "google-timezone-api";

let ExcelParserAsync = Promise.promisify(ExcelParser);

function Main(filename) {
	ExcelParserAsync(filename)
		.then(data => data.slice(1))
		.map(row => {
			return {
				excelDate: row[0],
				secondsFromEpoch: ExcelDateToSecondsFromEpoch(row[0]),
				city: row[1],
				state: row[2],
				reportNarrative: row[3],
				itemType: row[4],
				path: row[5],
			};
		})
		.map(eventRecord => {
			eventRecord.location = `${eventRecord.city}, ${eventRecord.state}`
			return eventRecord;
		})
		.map(eventRecord => {
			return CachingGeocoder.geocode(eventRecord.location)
				.then(record => {
					eventRecord.geocodeRecord = record;
					return eventRecord;
				});
		})
		.then(console.log)
		.catch(console.err);
}

function ExcelDateToSecondsFromEpoch(excelDate) {
	return Math.round((excelDate - 25569)*86400);
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}

class EventRecord {
	constructor(date, timeZoneId, city, state, reportNarrative, itemType, path) {
		this.date = date;
		this.timeZoneId = timeZoneId;
		this.city = city;
		this.state = state;
		this.reportNarrative = reportNarrative;
		this.itemType = itemType;
		this.path = path;
	}
}

class CachedGeocoder {
	constructor(geocoder) {
		this.geocoder = geocoder;
		this.cache = {};
	}

	geocode(location) {
		return new Promise((resolve, reject) => {
			if (location in this.cache) {
				// console.log(`Hit for ${location}`);
				resolve(this.cache[location]);
			}
			else {
				// console.log(`Miss for ${location}`);
				reject();
			}
		})
		.catch(() => this._geocode(location));
	}

	_geocode(location, timeout) {
		timeout = timeout || 0;
		return new Promise((resolve, reject) => {
				setTimeout(resolve, timeout);
			})
			.then(() => this.geocoder.geocode(location))
			.then(record => {
				// console.log(`Store for ${location}`);
				this.cache[location] = record;
				return record;
			})
			.catch(err => {
				// console.log(`Error for ${location}: `, err);
				return this._geocode(location, 250);
			})
	}
}

Commander
	.arguments("<file>")
	.action(Main)
	.parse(process.argv);