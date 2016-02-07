import timezoner from "google-timezone-api";
import Promise from "bluebird";
import makeRateLimited from "./RateLimitCurrier";
import makeCached from "./FileBackedCacheCurrier";

let rateLimited = makeRateLimited((latitude, longitude, timestamp) => timezoner({
	location: `${latitude},${longitude}`,
	timestamp: timestamp
}), 10);
export default makeCached(rateLimited, "timezone");