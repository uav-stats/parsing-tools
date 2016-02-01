import Promise from "bluebird";
import Commander from "commander";
import ExcelParser from "excel";
import CachingGeocoder from "./services/CachingGeocoder";
import { CachingTimezoneCoder } from "./services/CachingTimezoneCoder";
import EventRecord from "./models/EventRecord";

let ExcelParserAsync = Promise.promisify(ExcelParser);

function Main(filename) {
	ExcelParserAsync(filename)
		.then(data => data.slice(1, 20))
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
					eventRecord.geocodeRecord = record[0];
					eventRecord.coordinates = `${eventRecord.geocodeRecord.latitude},${eventRecord.geocodeRecord.longitude}`
					return eventRecord;
				});
		})
		.map(eventRecord => {
			return CachingTimezoneCoder(eventRecord.coordinates, eventRecord.secondsFromEpoch)
				.then(record => {
					eventRecord.timeZoneRecord = record;
					return eventRecord;
				});
		})
		.map(console.log)
		.catch(console.err);
}

function ExcelDateToSecondsFromEpoch(excelDate) {
	return Math.round((excelDate - 25569)*86400);
}

function ExcelDateToJSDate(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
}

Commander
	.arguments("<file>")
	.action(Main)
	.parse(process.argv);