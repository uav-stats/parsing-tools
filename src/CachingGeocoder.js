import Promise from "bluebird";
import Geocoder from "node-geocoder";

class CachingGeocoderImpl {
	constructor() {
		this._geocoder = Geocoder("google", "https", {
			apiKey: process.env.GOOGLE_MAPS_GEOCODER_API_KEY,
		});
		this._queue = [];
		this._lastQueueItem = -1;
		this._checkQueue();
		this._timeout = 0;
		this._cache = {};
	}

	_checkQueue() {
		if (this._queue.length - 1 > this._lastQueueItem) {
			var currentQueueItem = this._lastQueueItem + 1;
			var currentQueue = this._queue[currentQueueItem];
			this._geocode(currentQueue.location)
				.then(record => {
					currentQueue.resolve(record);
					this._timeout = 0;
					this._lastQueueItem = currentQueueItem;
				})
				.catch(err => {
					console.log(err);
					this._timeout = 1000;
				})
				.finally(() => {
					setTimeout(() => this._checkQueue(), this._timeout);
				});
		}
		else {
			setTimeout(() => this._checkQueue(), this._timeout);
		}
	}

	_geocode(location) {
		return new Promise((resolve, reject) => {
			if (location in this._cache) {
				resolve(this._cache[location]);
			}
			else {
				this._geocoder.geocode(location)
					.then(record => {
						this._cache[location] = record;
						resolve(record);
					})
					.catch(reject);
			}
		});
	}

	geocode(location) {
		return new Promise((resolve, reject) => {
			this._queue.push({
				location: location,
				resolve: resolve,
			});
		});
	}
}

export default new CachingGeocoderImpl()