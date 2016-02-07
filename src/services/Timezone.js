import timezoner from "google-timezone-api";
import makeRateLimited from "./RateLimitCurrier";
import makeCached from "./FileBackedCacheCurrier";


let timezone = function(latitude, longitude, timestamp) {
	return timezoner({
		location: `${latitude},${longitude}`,
		timestamp: timestamp
	})
		.then(result => {
			return new Promise((resolve, reject) => {
				if (result.errorMessage)
					reject(result);
				else
					resolve(result);
			})

		});
}
let rateLimited = makeRateLimited(timezone, 10);

export default makeCached(rateLimited, "timezone");