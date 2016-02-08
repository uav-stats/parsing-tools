import fs from "fs";
import path from "path";
import Promise from "bluebird";
import program from "commander";

let readFile = Promise.promisify(fs.readFile);
let writeFile = Promise.promisify(fs.writeFile);

program
	.version("1.0.0")
	.option("<jsonFileName> <postsPath>")
	.action((jsonFileName, postsPath) => {
		readFile(jsonFileName)
			.then(JSON.parse)
			.map(record => {
				return {
					fileName: path.join(postsPath, generateUniqueFileName(record)),
					content: generateContent(record),
				};
			})
			.map(file => {
				return writeFile(file.fileName, file.content)
					.then(() => file);
			})
			.then(files => {
				console.log(`Created ${files.length} posts...`);
			});
	})
	.parse(process.argv);

var fileNameCache = {};

function generateFileName(record, words) {
	var dateString = record.date.date.slice(0,10);
	var location = `${record.location.state}-${record.location.city}`;
	var title = record.report.narrative
		.split(/\W+/)
		.slice(0,words)
		.join("-");

	return `${dateString}-${location}-${title}`
		.toLowerCase()
		.replace(/[^a-z\d]+/gi, "-") + ".md";
}

function generateUniqueFileName(record) {
	var words = 6;
	var fileName = generateFileName(record, words);
	while (fileName in fileNameCache) {
		words++;
		fileName = generateFileName(record, words);
	}

	fileNameCache[fileName] = true;

	return fileName;
}

function generateContent(record) {
	var city = record.location.city || "Not specified";
	return `---
layout: post
title: ${city}, ${record.location.state} - ${record.report.narrative.split(/\W+/).slice(0,15).join(" ")}
categories: ${record.location.state.toLowerCase().replace(/[^a-z\d]+/gi, "-")} ${city.toLowerCase().replace(/[^a-z\d]+/gi, "-")}
latitude: ${record.location.latitude}
longitude: ${record.location.longitude}
city: ${city}
state: ${record.location.state}
date: ${record.date.date}
timeZoneName: ${record.date.timeZoneName}
---

${record.report.narrative}`;
}