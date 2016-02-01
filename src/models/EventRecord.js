export class EventRecord {
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