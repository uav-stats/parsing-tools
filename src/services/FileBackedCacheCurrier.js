import fs from "fs";
import path from "path";
import touch from "touch";
import Promise from "bluebird";

let writeFile = Promise.promisify(fs.writeFile);

export default function (func, funcName) {
	let moduleName = path.basename(__filename, ".js");
	funcName = funcName || func.name;
	if (!funcName) {
		throw new Error("Function to be cached must have a name");
	}

	let cacheFileName = path.join(process.cwd(), `.${moduleName}.${funcName}.json`);

	touch.sync(cacheFileName);
	var cacheFile = fs.readFileSync(cacheFileName, "utf8");
	let cache = cacheFile.length && JSON.parse(cacheFile) || {};

	return function() {
		return new Promise(resolve => {
			var key = JSON.stringify(arguments);
			if (key in cache) {
				resolve(cache[key]);
			}
			else {
				func.apply(this, arguments)
					.then(result => cache[key] = result)
					.then(result => {
						writeFile(cacheFileName, JSON.stringify(cache, null, "\t"));
						return result;
					})
					.then(resolve);
			}
		});
	};
}