import geocode from "./services/Geocoder";
import timezone from "./services/Timezone";
import readSpreadsheet from "./services/Excel";
import program from "commander";

program
	.version("1.0.0")
	.option("<file>")
	.action(fileName => {
		readSpreadsheet(fileName)
			.then(rows => rows.slice(1))
			.map(row => {
				return {
					date: {
						localTimestamp: Math.round((row[0] - 25569)*86400),
					},
					location: {
						city: row[1],
						state: row[2],
					},
					report: {
						narrative: row[3],
					},
					itemType: row[4],
					path: row[5],
				};
			})
			.map(record => {
				return geocode(`${record.location.city}, ${record.location.state}`)
					.then(results => {
						if (results.length) return results;

						return geocode(record.location.state);
					})
					.then(results => results[0])
					.then(result => {
						record.location.latitude = result.latitude;
						record.location.longitude = result.longitude;
						return record;
					})
					.catch(err => {
						console.error(err, record);
						return record;
					});
			})
			.map(record => {
				return timezone(record.location.latitude, record.location.longitude, record.date.localTimestamp)
					.then(result => {
						record.date.timestamp = record.date.localTimestamp + result.dstOffset + result.rawOffset;
						record.date.dstOffset = result.dstOffset;
						record.date.rawOffset = result.rawOffset;
						record.date.timeZoneId = result.timeZoneId;
						record.date.timeZoneName = result.timeZoneName;
						record.date.date = new Date(record.date.timestamp * 1000);
						return record;
					})
					.catch(err => {
						console.error(err, record);
						return record;
					});
			})
			.then(records => JSON.stringify(records, null, "\t"))
			.then(console.log);
	})
	.parse(process.argv);
