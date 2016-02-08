import fs from "fs";
import Promise from "bluebird";
import program from "commander";
import natural from "natural";
import readline from "readline";

let readFile = Promise.promisify(fs.readFile);
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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
				.catch(err => {
					console.error(`Could not load ${trainingFileName}: ${err}`);
					console.error("Creating new classifier");
					return new natural.BayesClassifier();
				})
				.then(classifier => {
					return {
						classifier: classifier,
						records: records,
					};
				}))
			.then(tuple => {
				var classifier = tuple.classifier;

				return new Promise(resolve => resolve(tuple.records))
					.then(records => shuffle(records))
					.map(record => record.report.narrative)
					.then(narratives => {
						var chain = new Promise(resolve => resolve());
						for (var i = 0, il = narratives.length; i < il; i++) {
							let narrative = narratives[i];
							chain = chain
								.then(() => classifyNarrative(narrative))
								.then(classification => {
									console.log("Recording answers: ", narrative, classification);
									classifier.addDocument(narrative, classification);
								});
						}
						return chain
							.catch(() => console.error("User indicated end of training..."));
					})
					.then(() => new Promise(resolve => {
						rl.close();
						classifier.train();
						classifier.save(trainingFileName, (err, c) => resolve(c));
					}));
			})
			.then(() => console.log(`Training saved to ${trainingFileName}`));
	})
	.parse(process.argv);

function classifyNarrative(narrative) {
	return new Promise((resolve, reject) => {
		rl.question(`\n\nClassify "${narrative}" or [blank] to end training:`, answer => {
			if (answer)
				resolve(answer);
			else
				reject();
		});
	});
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
