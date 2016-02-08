import program from "commander";

program
	.version("1.0.0")
	.command("parse <file>", "Parse UAV events spreadsheets into JSON file")
	.command("create-posts <file>", "Create Jekyll posts from JSON file")
	.command("train <file> <trainingFile>", "Train a classifier based on JSON and interactive prompts")
	.command("classify <file> <trainingFile>", "Classify JSON file using a training file")
	.parse(process.argv);
