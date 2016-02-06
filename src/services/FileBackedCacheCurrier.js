import fs from "fs";
import path from "path";
import touch from "touch";

export default function (func, cacheFileName) {
	let moduleName = path.basename(__filename, ".js");
	if (!func.name) {
		throw new Error("Function to be cached must have a name");
	}

	if (!cacheFileName) {
		cacheFileName = path.join(process.cwd(), `.${moduleName}.${func.name}.json`);
	}

	touch.sync(cacheFileName);
	var cacheFile = fs.readFileSync(cacheFileName, "utf8");
	let cache = cacheFile.length && JSON.parse(cacheFile) || {};

	return function() {
		var key = JSON.stringify(arguments);
		if (key in cache) {
			return cache[key];
		}

		var result = func.apply(this, arguments);
		cache[key] = result;

		fs.writeFile(cacheFileName, JSON.stringify(cache));

		return result;
	};
}