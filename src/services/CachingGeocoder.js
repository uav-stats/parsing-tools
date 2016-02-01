import Promise from "bluebird";
import Geocoder from "node-geocoder";

class CachingGeocoderImpl {
	constructor() {
		this._geocoder = Geocoder("google", "https", {
			apiKey: process.env.GOOGLE_MAPS_GEOCODER_API_KEY,
		});
		this._queue = [];
		this._lastIndex = -1;
		this._timeout = 0;
		this._cache = {};
		this._running = false;
	}

	_queueContainsNewItems() {
		return this._queue.length - 1 > this._lastIndex;
	}

	_checkQueue() {
		if (this._running) return;

		if (this._queueContainsNewItems()) {
			this._running = true;
			var index = this._lastIndex + 1;
			var item = this._queue[index];
			this._geocode(item.location)
				.then(record => {
					item.resolve(record);
					this._timeout = 0;
					this._lastIndex = index;
				})
				.catch(err => {
					console.log(err);
					this._timeout = 1000;
				})
				.finally(() => {
					this._running = false;

					if (this._queueContainsNewItems())
						setTimeout(() => this._checkQueue(), this._timeout);
				});
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
			this._checkQueue();
		});
	}
}

export default new CachingGeocoderImpl()