import Promise from "bluebird";
import Timezone from "google-timezone-api";

var _cache = {};

export function CachingTimezoneCoder(location, timestampInSecondsSinceEpoch) {
	return new Promise((resolve, reject) => {
		var key = {
			location: location,
			timestamp: timestampInSecondsSinceEpoch,
		};

		if (key in _cache) {
			resolve(_cache[key]);
		}
		else {
			Timezone({
				location: location,
				timestamp: timestampInSecondsSinceEpoch,
				key: process.env.GOOGLE_MAPS_TIME_ZONE_API_KEY,
			})
				.then(record => {
					_cache[key] = record;
					resolve(record);
				})
				.catch(err => console.error(err));
		}
	});
}