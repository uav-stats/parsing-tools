import fs from "fs";
import path from "path";
import Promise from "bluebird";
import program from "commander";
import natural from "natural";

let readFile = Promise.promisify(fs.readFile);

program
	.version("1.0.0")
	.option("<jsonFileName> <trainingFileName>")
	.action((jsonFileName, trainingFileName) => {
		readFile(jsonFileName)
			.then(JSON.parse)
			.then(records => new Promise((resolve, reject) => {
				natural.BayesClassifier.load(trainingFileName, null, (err, classifier) => {
					if (err)
						reject(err);
					else
						resolve(classifier);
				});
			})
				.then(classifier => {
					return {
						classifier: classifier,
						records: records,
					};
				}))
			.then(tuple => {
				let key = path.basename(trainingFileName, ".training.json").replace(/^\./, "");
				let classifier = tuple.classifier;
				return tuple.records
					.map(record => {
						record.report[key] = classifier.classify(record.report.narrative);
						return record;
					});
			})
			.then(console.log);
	})
	.parse(process.argv);