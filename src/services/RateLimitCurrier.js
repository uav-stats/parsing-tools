import Promise from "bluebird";

export default function RateLimit(fn, maxCallsPerSecond) {
	var queue = [],
		calls = [];

	function processQueue() {
		var now = Date.now().valueOf();
		var actualCallsInLastSecond = calls.filter(c => c > now - 1000);
		var actualCallsPerSecond = actualCallsInLastSecond.length;

		if (actualCallsPerSecond >= maxCallsPerSecond)
		{
			var lastCall = Math.max.apply(null, actualCallsInLastSecond);
			var timeout = Math.max((lastCall + (1000 / maxCallsPerSecond)) - now, 0);
			setTimeout(processQueue, timeout);
			return;
		}

		var item = queue.shift();
		if (item) {
			calls.push(Date.now().valueOf());
			fn.apply(this, item.arguments)
				.then(item.resolve)
				.catch(() => queue.push(item));
		}

		if (queue.length)
			processQueue();
	}

	return function limited() {
		return new Promise(resolve => {
			queue.push({
				arguments: [].slice.call(arguments),
				resolve: resolve
			});
			processQueue();
		});
	};
}
